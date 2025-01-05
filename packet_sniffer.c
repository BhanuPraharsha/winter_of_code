#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <netinet/ip.h>
#include <netinet/tcp.h>
#include <netinet/udp.h>
#include <netinet/if_ether.h>
#include <netinet/ip_icmp.h>
#include <sqlite3.h>
#include <libwebsockets.h>
#include <time.h>


#define MAX_PAYLOAD 65536

sqlite3 *db;
sqlite3_stmt *stmt;

int tcp_count = 0, udp_count = 0, icmp_count = 0, other_count = 0;

typedef struct {
    char src_ip[INET_ADDRSTRLEN];
    char dest_ip[INET_ADDRSTRLEN];
    char protocol[10];
    int tcp_src_port;
    int tcp_dest_port;
    int udp_src_port;
    int udp_dest_port;
    uint32_t  seq_num;
    uint32_t  ack_num;
    int icmp_type;
    int icmp_code;
    char payload[1024];
} packet_data_t;

packet_data_t packet_data;


// Function to initialize SQLite database
void init_db() {
    if (sqlite3_open("packets.db", &db)) {
        fprintf(stderr, "Can't open database: %s\n", sqlite3_errmsg(db));
        exit(1);
    }
    // Enable WAL mode for better concurrency
    sqlite3_exec(db, "PRAGMA journal_mode=WAL;", NULL, NULL, NULL);

     const char *create_table_sql = \
        "CREATE TABLE IF NOT EXISTS packets (" \
        "id INTEGER PRIMARY KEY AUTOINCREMENT, " \
        "src_ip TEXT, " \
        "dest_ip TEXT, " \
        "protocol TEXT, " \
        "tcp_src_port INTEGER, " \
        "tcp_dest_port INTEGER, " \
        "udp_src_port INTEGER, " \
        "udp_dest_port INTEGER, " \
        "sequence_number UNSIGNED INTEGER, " \
        "ack_number UNSIGNED INTEGER, " \
        "icmp_type INTEGER, " \
        "icmp_code INTEGER, " \
        "payload TEXT, " \
        "count INTEGER DEFAULT 0);";

    if (sqlite3_exec(db, create_table_sql, 0, 0, 0) != SQLITE_OK) {
        fprintf(stderr, "SQL error: %s\n", sqlite3_errmsg(db));
        sqlite3_close(db);
        exit(1);
    }
}




// Function to store or update packet statistics in the database
void store_statistics(const char *protocol) {
    const char *select_sql = "SELECT id, count FROM packets WHERE src_ip IS NULL AND dest_ip IS NULL AND protocol = ?;";
    const char *update_sql = "UPDATE packets SET count = ? WHERE id = ?;";
    const char *insert_sql = "INSERT INTO packets (protocol, count) VALUES (?, ?);";

    int count = 0;
    int row_id = -1;

    // Check if the statistics entry exists
    if (sqlite3_prepare_v2(db, select_sql, -1, &stmt, 0) == SQLITE_OK) {
        sqlite3_bind_text(stmt, 1, protocol, -1, SQLITE_STATIC);
        if (sqlite3_step(stmt) == SQLITE_ROW) {
            row_id = sqlite3_column_int(stmt, 0);
            count = sqlite3_column_int(stmt, 1);
        }
    }
    sqlite3_finalize(stmt);

    count++;

    if (row_id != -1) {
        // Update existing entry
        if (sqlite3_prepare_v2(db, update_sql, -1, &stmt, 0) == SQLITE_OK) {
            sqlite3_bind_int(stmt, 1, count);
            sqlite3_bind_int(stmt, 2, row_id);
            sqlite3_step(stmt);
        }
    } else {
        // Insert new entry
        if (sqlite3_prepare_v2(db, insert_sql, -1, &stmt, 0) == SQLITE_OK) {
            sqlite3_bind_text(stmt, 1, protocol, -1, SQLITE_STATIC);
            sqlite3_bind_int(stmt, 2, count);
            sqlite3_step(stmt);
        }
    }
    // printf("in statistics\n");
    sqlite3_finalize(stmt);
    // printf("end if statistics\n");
}

// Function to store packet data in the database
void store_packet(const char *src_ip, const char *dest_ip, const char *protocol, int tcp_src_port, int tcp_dest_port, int udp_src_port, int udp_dest_port, uint32_t  seq_num, uint32_t  ack_num, int icmp_type, int icmp_code, const char *payload) {
    const char *insert_sql = "INSERT INTO packets (src_ip, dest_ip, protocol, tcp_src_port, tcp_dest_port, udp_src_port, udp_dest_port, sequence_number, ack_number, icmp_type, icmp_code, payload) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
    // printf("Inside store packet\n");
    if (sqlite3_prepare_v2(db, insert_sql, -1, &stmt, 0) != SQLITE_OK) {
        fprintf(stderr, "Failed to prepare statement: %s\n", sqlite3_errmsg(db));
        return;
    }

    sqlite3_bind_text(stmt, 1, src_ip, -1, SQLITE_STATIC);
    sqlite3_bind_text(stmt, 2, dest_ip, -1, SQLITE_STATIC);
    sqlite3_bind_text(stmt, 3, protocol, -1, SQLITE_STATIC);
    sqlite3_bind_int(stmt, 4, tcp_src_port);
    sqlite3_bind_int(stmt, 5, tcp_dest_port);
    sqlite3_bind_int(stmt, 6, udp_src_port);
    sqlite3_bind_int(stmt, 7, udp_dest_port);
    sqlite3_bind_int(stmt, 8, seq_num);
    sqlite3_bind_int(stmt, 9, ack_num);
    sqlite3_bind_int(stmt, 10, icmp_type);
    sqlite3_bind_int(stmt, 11, icmp_code);
    sqlite3_bind_text(stmt, 12, payload, -1, SQLITE_STATIC);

    if (sqlite3_step(stmt) != SQLITE_DONE) {
        fprintf(stderr, "Failed to execute statement: %s\n", sqlite3_errmsg(db));
    }

    sqlite3_finalize(stmt);

    // Update statistics
    store_statistics(protocol);

    
}

void print_payload_ascii(const char *data, int size, char *ascii_payload) {
    int index = 0; // Track the index in ascii_payload
    for (int i = 0; i < size; i++) {
        if (data[i] >= 32 && data[i] <= 126) {
            ascii_payload[index++] = data[i];
        } else {
            ascii_payload[index++] = '.';
        }
    }
    ascii_payload[index] = '\0'; // Null-terminate the string
}



// Function to parse ICMP header
void parse_icmp_header(const unsigned char *buffer, int size, const char *src_ip, const char *dest_ip) {
    struct icmphdr *icmp_header = (struct icmphdr *)(buffer + sizeof(struct ethhdr) + sizeof(struct iphdr));

    // printf("ICMP Packet:\n");
    // printf("  Type: %u\n", icmp_header->type);
    // printf("  Code: %u\n", icmp_header->code);

    store_packet(src_ip, dest_ip, "ICMP", 0, 0, 0, 0, 0, 0, icmp_header->type, icmp_header->code, "");
    icmp_count++;
}

// Function to parse TCP header
void parse_tcp_header(const unsigned char *buffer, int size, const char *src_ip, const char *dest_ip) {
    struct tcphdr *tcp_header = (struct tcphdr *)(buffer + sizeof(struct ethhdr) + sizeof(struct iphdr));
    int header_size = sizeof(struct ethhdr) + sizeof(struct iphdr) + tcp_header->doff * 4;

    char ascii_payload[MAX_PAYLOAD] = "";
    if (size > header_size) {
        print_payload_ascii(buffer + header_size, size - header_size, ascii_payload);
    }
// Extract sequence and acknowledgment numbers as unsigned integers
    uint32_t seq_num = ntohl(tcp_header->seq);
    uint32_t ack_num = ntohl(tcp_header->ack_seq);
    
    // store_packet(src_ip, dest_ip, "TCP", ntohs(tcp_header->source), ntohs(tcp_header->dest), 0, 0, ntohl(tcp_header->seq), ntohl(tcp_header->ack_seq), 0, 0, ascii_payload);
     store_packet(src_ip, dest_ip, "TCP", 
                 ntohs(tcp_header->source), ntohs(tcp_header->dest), 
                 0, 0, 
                 seq_num, ack_num, 
                 0, 0, 
                 ascii_payload);
    tcp_count++;
}



// Function to parse DNS query and extract domain name
void parse_dns_query(const unsigned char *buffer, int size) {
    printf("INSIDE PARSEDNSQUERY ********************************************\n");
    if (size < 12) {
        printf("Invalid DNS query size.\n");
        return;
    }

    // DNS header is 12 bytes long, so the query starts after that
    const unsigned char *query = buffer + 12;
    char domain[256] = {0};
    int pos = 0;

    while (*query && pos < sizeof(domain) - 1) {
        int label_len = *query++;
        if (label_len > 0) {
            if (pos > 0) domain[pos++] = '.';
            strncpy(domain + pos, (const char *)query, label_len);
            pos += label_len;
            query += label_len;
        }
    }

    printf("Extracted domain: %s\n", domain);

    // Check if the domain is the same as the last processed one and if the last trigger was within 10 seconds
    static char last_domain[256] = "";
    static time_t last_trigger_time = 0;
    
    if (strcmp(last_domain, domain) == 0 && (time(NULL) - last_trigger_time) < 10) {
        printf("Skipping domain %s, last trigger was within 10 seconds.\n", domain);
        return;  // Skip this domain if it's the same as last processed and within 10 seconds
    }

    // Update the last processed domain and time
    strcpy(last_domain, domain);
    last_trigger_time = time(NULL);


    // Check for specific domains
    if (strstr(domain, "instagram.com") || strstr(domain, "facebook.com")) {
        printf("Triggering keylogger for domain: %s\n", domain);
        
        // Prepare the command to call the Python script
        char command[512];
        // snprintf(command, sizeof(command), "python3 action.py %s", domain);
        snprintf(command, sizeof(command), "/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe -Command \"python C:/Users/praha/Documents/WOC/keylogger/updated_kelloger.py %s\"", domain);

        // Call the Python script
        int ret = system(command);
        if (ret != 0) {
            fprintf(stderr, "Error executing python script****************************************************************************************************************************** for domain: %s\n", domain);
        }

        
        printf("Adding a delay to avoid rapid requests...\n");
        sleep(60);  // 60 seconds delay to simulate more natural behavior

    }
}





void parse_udp_header(const unsigned char *buffer, int size, const char *src_ip, const char *dest_ip) {
    struct udphdr *udp_header = (struct udphdr *)(buffer + sizeof(struct ethhdr) + sizeof(struct iphdr));
    int header_size = sizeof(struct ethhdr) + sizeof(struct iphdr) + sizeof(struct udphdr);

    char ascii_payload[MAX_PAYLOAD] = "";
    if (size > header_size) {
        print_payload_ascii(buffer + header_size, size - header_size, ascii_payload);
    }

    // Check if the UDP packet is DNS (port 53)
    if (ntohs(udp_header->dest) == 53 || ntohs(udp_header->source) == 53) {
        printf("DNS Query detecteddddddddddd\n");
        parse_dns_query(buffer + header_size, size - header_size);  // Parse DNS query
    }

    store_packet(src_ip, dest_ip, "UDP", 0, 0, ntohs(udp_header->source), ntohs(udp_header->dest), 0, 0, 0, 0, ascii_payload);
    udp_count++;
}

// Function to parse IP header
void parse_ip_header(const unsigned char *buffer, int size) {
    struct iphdr *ip_header = (struct iphdr *)(buffer + sizeof(struct ethhdr));
    struct sockaddr_in src, dest;
    // printf("In side Parse IP Header\n");
    src.sin_addr.s_addr = ip_header->saddr;
    dest.sin_addr.s_addr = ip_header->daddr;



    char src_ip[INET_ADDRSTRLEN], dest_ip[INET_ADDRSTRLEN];
    inet_ntop(AF_INET, &src.sin_addr, src_ip, INET_ADDRSTRLEN);
    inet_ntop(AF_INET, &dest.sin_addr, dest_ip, INET_ADDRSTRLEN);

     // Ignore packets involving localhost (172.23.15.193)
        if ((strcmp(src_ip, "172.23.151.193") == 0) && (strcmp(dest_ip, "172.23.151.193") == 0)) {
            printf("Ignored localhost packet: src=%s, dest=%s\n", src_ip, dest_ip);
        }
        else{

        printf("@@@Traffic to outbound@@@\n");
    switch (ip_header->protocol) {
        case 1:  // ICMP
              printf("  Protocol ICMP handled.\n");
            parse_icmp_header(buffer, size, src_ip, dest_ip);
            break;
        case 6:  // TCP
                  printf("  Protocol TCP handled.\n");
            parse_tcp_header(buffer, size, src_ip, dest_ip);
            break;
        case 17: // UDP
                  printf("  Protocol UDP handled.\n");
            parse_udp_header(buffer, size, src_ip, dest_ip);
            break;
        default:
            printf("  Protocol not handled.\n");
            store_packet(src_ip, dest_ip, "Other", 0, 0, 0, 0, 0, 0, 0, 0, "");
            other_count++;
    }
        }
}

// Function to process packets
void process_packet(unsigned char *buffer, int size) {
    struct ethhdr *eth_header = (struct ethhdr *)buffer;

          parse_ip_header(buffer, size);
    }


void print_statistics() {
    printf("\nPacket Statistics:\n");
    printf("  TCP Packets: %d\n", tcp_count);
    printf("  UDP Packets: %d\n", udp_count);
    printf("  ICMP Packets: %d\n", icmp_count);
    printf("  Other Packets: %d\n", other_count);
}



int main() {
    int raw_socket;
    struct sockaddr saddr;
    int saddr_size;
    unsigned char *buffer = (unsigned char *)malloc(MAX_PAYLOAD);
printf("before init bd");
    init_db();
printf("after init db");
    raw_socket = socket(AF_PACKET, SOCK_RAW, htons(ETH_P_ALL));
    // raw_socket = socket(AF_PACKET, SOCK_RAW, IPPROTO_IP);
    printf("socket is created");

    if (raw_socket < 0) {
        perror("Socket Error");
        printf("socket error");
        return 1;
    }

   

    // Run the event loop
    while (1) {
        saddr_size = sizeof(saddr);
        int packet_size = recvfrom(raw_socket, buffer, MAX_PAYLOAD, 0, &saddr, (socklen_t *)&saddr_size);
        if (packet_size < 0) {
            perror("Recvfrom Error");
            printf("Recvfrom error");
            break;
        }
        process_packet(buffer, packet_size);
        printf("After process packet\n");
        // printf(packet_size);
        
    }

    close(raw_socket);
    free(buffer);
    sqlite3_close(db);
    // lws_context_destroy(context);
    return 0;
}
