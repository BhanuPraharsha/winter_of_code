import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppConfig } from './appconfig';

@Injectable({
  providedIn: 'root'
})
export class MetricsService {

  constructor(private http: HttpClient) { }
  private apiUrl = AppConfig.apiEndpoint;
  trafficByProtocol(): Observable<any> 
  {
    
   return  this.http.get(this.apiUrl+'/traffic-by-protocol');    
  }
  topSourceIps():Observable<any> {
    return  this.http.get(this.apiUrl+'/top-source-ips');    
  }
  topDestinationIps():Observable<any> {
    return  this.http.get(this.apiUrl+'/top-destination-ips');    
  }
  packetCountByTime():Observable<any> {
    return  this.http.get(this.apiUrl+'/packet-count-by-time');    
  }
  portUsageTcp():Observable<any> {
    return  this.http.get(this.apiUrl+'/port-usage-tcp');    
  }
  portUsageUdp():Observable<any> {
    return  this.http.get(this.apiUrl+'/port-usage-udp');    
  }
  totalTrafficVolume():Observable<any> {
    return  this.http.get(this.apiUrl+'/traffic-volume-total');    
  }

  fetchMetrics(): void {
    // this.http.get('http://172.23.151.193:8000/traffic-by-protocol').subscribe((data: any) => {
    //   this.trafficByProtocol = {
    //     labels: data.map((item: any) => item.label),
    //     datasets: [
    //       {
    //         label: 'Packet Count',
    //         data: data.map((item: any) => item.packet_count),
    //         backgroundColor: '#42A5F5',
    //       },
    //       {
    //         label: 'Total Payload Size (bytes)',
    //         data: data.map((item: any) => item.total_payload_size),
    //         backgroundColor: '#66BB6A',
    //       }
    //     ]
    //   };
    // });

    // this.http.get('http://172.23.151.193:8000/top-source-ips').subscribe((data: any) => {
    //   this.topSourceIps = {
    //     labels: data.map((item: any) => item.label),
    //     datasets: [
    //       {
    //         label: 'Packet Count',
    //         data: data.map((item: any) => item.packet_count),
    //         backgroundColor: '#FF7043',
    //       },
    //       {
    //         label: 'Total Payload Size (bytes)',
    //         data: data.map((item: any) => item.total_payload_size),
    //         backgroundColor: '#FFEB3B',
    //       }
    //     ]
    //   };
    // });

    // this.http.get('http://172.23.151.193:8000/top-destination-ips').subscribe((data: any) => {
    //   this.topDestinationIps = {
    //     labels: data.map((item: any) => item.label),
    //     datasets: [
    //       {
    //         label: 'Packet Count',
    //         data: data.map((item: any) => item.packet_count),
    //         backgroundColor: '#8E24AA',
    //       },
    //       {
    //         label: 'Total Payload Size (bytes)',
    //         data: data.map((item: any) => item.total_payload_size),
    //         backgroundColor: '#FF8A65',
    //       }
    //     ]
    //   };
    // });

    // this.http.get('http://172.23.151.193:8000/packet-count-by-time').subscribe((data: any) => {
    //   this.packetCountByTime = {
    //     labels: data.map((item: any) => item.label),
    //     datasets: [
    //       {
    //         label: 'Packet Count',
    //         data: data.map((item: any) => item.packet_count),
    //         fill: false,
    //         borderColor: '#42A5F5',
    //         tension: 0.1
    //       },
    //       {
    //         label: 'Total Payload Size (bytes)',
    //         data: data.map((item: any) => item.total_payload_size),
    //         fill: false,
    //         borderColor: '#66BB6A',
    //         tension: 0.1
    //       }
    //     ]
    //   };
    // });

    // this.http.get('http://172.23.151.193:8000/port-usage-tcp').subscribe((data: any) => {
    //   this.portUsageTcp = {
    //     labels: data.map((item: any) => `${item.label}`),
    //     datasets: [
    //       {
    //         label: 'Packet Count',
    //         data: data.map((item: any) => item.packet_count),
    //         backgroundColor: '#FFEB3B',
    //       },
    //       {
    //         label: 'Total Payload Size (bytes)',
    //         data: data.map((item: any) => item.total_payload_size),
    //         backgroundColor: '#8E24AA',
    //       }
    //     ]
    //   };
    // });

    // this.http.get('http://172.23.151.193:8000/port-usage-udp').subscribe((data: any) => {
    //   this.portUsageUdp = {
    //     labels: data.map((item: any) => `${item.label}`),
    //     datasets: [
    //       {
    //         label: 'Packet Count',
    //         data: data.map((item: any) => item.packet_count),
    //         backgroundColor: '#FF7043',
    //       },
    //       {
    //         label: 'Total Payload Size (bytes)',
    //         data: data.map((item: any) => item.total_payload_size),
    //         backgroundColor: '#66BB6A',
    //       }
    //     ]
    //   };
    // });

    // this.http.get('http://172.23.151.193:8000/traffic-volume-total').subscribe((data: any) => {
    //   this.totalTrafficVolume = data.total_payload_size;
    // });
  }
}
