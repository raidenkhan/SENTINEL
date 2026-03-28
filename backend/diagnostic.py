import socket
import sys

def check_dns(hostname):
    try:
        addr = socket.gethostbyname(hostname)
        print(f"Resolved {hostname} to {addr}")
    except socket.gaierror as e:
        print(f"Failed to resolve {hostname}: {e}")

if __name__ == "__main__":
    check_dns("oaoaagctuvlxbwetuumz.supabase.co")
    check_dns("google.com")
