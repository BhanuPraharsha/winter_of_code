from fastapi import FastAPI, WebSocket, Depends, HTTPException, status,BackgroundTasks, HTTPException
from fastapi.responses import HTMLResponse
import sqlite3
from pydantic import BaseModel
from passlib.context import CryptContext
from typing import List, Optional, Dict,Any
from fastapi.middleware.cors import CORSMiddleware
from pynput.keyboard import Listener, Key
import logging
from datetime import datetime

from fastapi.responses import PlainTextResponse
import os
from datetime import datetime

app = FastAPI()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# List of allowed origins (frontend URLs)
origins = [
    "http://localhost:4200",  # Example for Angular frontend running locally
    "http://<ip_goes_here>:8080",  # If your frontend is hosted at this address
    "http://example.com",  # Example of a specific frontend URL
    "*",  # Allows all origins (use cautiously in production)
]

# Add CORS middleware to the app
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # List of allowed origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)


# def create_tables():
#     conn = sqlite3.connect('packets.db')
#     cursor = conn.cursor()

#     # Creating 'users' table
#     cursor.execute('''CREATE TABLE IF NOT EXISTS users (
#                         userid INTEGER PRIMARY KEY AUTOINCREMENT,
#                         username TEXT NOT NULL UNIQUE,
#                         password TEXT NOT NULL,
#                         last_login TIMESTAMP,
#                         current_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
#                       )''')

#     # # Creating 'packets' table (assuming packet has id and content for example)
#     # cursor.execute('''CREATE TABLE IF NOT EXISTS packets (
#     #                     id INTEGER PRIMARY KEY AUTOINCREMENT,
#     #                     content TEXT NOT NULL,
#     #                     timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
#     #                   )''')

#     conn.commit()
#     conn.close()

# create_tables();



# Pydantic model for user data
class User(BaseModel):
    username: str
    password: str

class UserInDB(User):
    hashed_password: str
    last_login: Optional[datetime]

# Utility function for password hashing
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# Utility function to verify password
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Database connection helper
def get_db_connection():
    conn = sqlite3.connect('packets.db')
    return conn

# CRUD operation for user login
@app.post("/login")
async def login(user: User):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE username = ?", (user.username,))
    db_user = cursor.fetchone()
    conn.close()

    if db_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if not verify_password(user.password, db_user[2]):  # db_user[2] is the hashed password
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid password")

    # Update last login timestamp
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET last_login = ? WHERE username = ?", (datetime.now(), user.username))
    conn.commit()
    conn.close()

    return {"message": "Login successful", "username": user.username}

# Register a new user
@app.post("/register")
async def register(user: User):
    hashed_password = hash_password(user.password)

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("INSERT INTO users (username, password) VALUES (?, ?)", (user.username, hashed_password))
    conn.commit()
    conn.close()

    return {"message": "User created successfully"}

# # Endpoint for listing all packets
# @app.get("/packets", response_model=List[str])
# async def get_packets():
#     conn = get_db_connection()
#     cursor = conn.cursor()
#     cursor.execute("SELECT * FROM packets")
#     packets = cursor.fetchall()
#     conn.close()

#     return [packet[0] for packet in packets]

# Endpoint for listing all packets with all columns dynamically
@app.get("/packets", response_model=List[Dict[str, Any]])
async def get_packets():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(packets)")  # Get column names dynamically
    columns = [column[1] for column in cursor.fetchall()]  # Extract column names

    cursor.execute("SELECT * FROM packets order by id desc")
    packets = cursor.fetchall()
    conn.close()

    # Convert each row into a dictionary where keys are column names
    packet_list = [
        {columns[i]: packet[i] for i in range(len(columns))} for packet in packets
    ]

    return packet_list

# # CRUD operations for packets (add a new packet)
# @app.post("/packets")
# async def add_packet(content: str):
#     conn = get_db_connection()
#     cursor = conn.cursor()
#     cursor.execute("INSERT INTO packets (content) VALUES (?)", (content,))
#     conn.commit()
#     conn.close()

#     return {"message": "Packet added successfully"}



def execute_query(query: str) -> List[Dict]:
    # conn = sqlite3.connect("packets.db")
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(query)
    rows = cursor.fetchall()
    conn.close()
    
    # Convert results into a list of dictionaries
    return [{"label": row[0], "packet_count": row[1], "total_payload_size": row[2]} for row in rows]

@app.get("/traffic-by-protocol")
def traffic_by_protocol():
    query = """
    SELECT protocol, COUNT(*) AS packet_count, SUM(LENGTH(payload)) AS total_payload_size
    FROM packets
    GROUP BY protocol;
    """
    return execute_query(query)

@app.get("/top-source-ips")
def top_source_ips():
    query = """
    SELECT src_ip, COUNT(*) AS packet_count, SUM(LENGTH(payload)) AS total_payload_size
    FROM packets
    GROUP BY src_ip
    ORDER BY packet_count DESC
    LIMIT 10;
    """
    return execute_query(query)

@app.get("/top-destination-ips")
def top_destination_ips():
    query = """
    SELECT dest_ip, COUNT(*) AS packet_count, SUM(LENGTH(payload)) AS total_payload_size
    FROM packets
    GROUP BY dest_ip
    ORDER BY packet_count DESC
    LIMIT 10;
    """
    return execute_query(query)

@app.get("/packet-count-by-time")
def packet_count_by_time():
    query = """
    SELECT strftime('%Y-%m-%d %H:%M:%S', timestamp) AS time, COUNT(*) AS packet_count, SUM(LENGTH(payload)) AS total_payload_size
    FROM packets
    GROUP BY time
    ORDER BY time;
    """
    return execute_query(query)

@app.get("/port-usage-tcp")
def port_usage_tcp():
    query = """
    SELECT tcp_src_port, tcp_dest_port, COUNT(*) AS packet_count, SUM(LENGTH(payload)) AS total_payload_size
    FROM packets
    WHERE protocol = 'TCP'
    GROUP BY tcp_src_port, tcp_dest_port
    ORDER BY packet_count DESC
    LIMIT 10;
    """
    return execute_query(query)

@app.get("/port-usage-udp")
def port_usage_udp():
    query = """
    SELECT udp_src_port, udp_dest_port, COUNT(*) AS packet_count, SUM(LENGTH(payload)) AS total_payload_size
    FROM packets
    WHERE protocol = 'UDP'
    GROUP BY udp_src_port, udp_dest_port
    ORDER BY packet_count DESC
    LIMIT 10;
    """
    return execute_query(query)

@app.get("/traffic-volume-total")
def traffic_volume_total():
    query = """
    SELECT SUM(LENGTH(payload)) AS total_payload_size
    FROM packets;
    """
    conn = sqlite3.connect("packets.db")
    cursor = conn.cursor()
    cursor.execute(query)
    row = cursor.fetchone()
    conn.close()
    return {"total_payload_size": row[0]}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("Before while from server");
    while True:
        data = await websocket.receive_text()
        print(f"Received: {data}")
        await websocket.send_text(f"Message: {data}")



# Define the path to the log file
# log_file_path = r'\\wsl.localhost\Ubuntu\home\bhanu_praharsha\session_keylog'
log_file_path = '/home/bhanu_praharsha/session_keylog.txt'

@app.get('/logs', response_class=PlainTextResponse)
def get_logs():
    if os.path.exists(log_file_path):
        with open(log_file_path, 'r') as file:
            logs = file.read()
        return logs
    else:
        raise HTTPException(status_code=404, detail='Log file not found')

# Run the application
# You can run this script with: uvicorn script_name:app --reload


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="<ip>", port=8080)