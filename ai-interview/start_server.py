#!/usr/bin/env python3
"""
Simple HTTPS server for testing the AI Interview Assistant on mobile devices.
Run this script and access your app at https://your-computer-ip:8443
"""
import http.server
import socketserver
import ssl
import socket
import os

def get_local_ip():
    """Get the local IP address of this machine."""
    try:
        # Connect to a remote server to determine local IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except:
        return "localhost"

def create_ssl_cert():
    """Create a self-signed SSL certificate for HTTPS."""
    try:
        from cryptography import x509
        from cryptography.x509.oid import NameOID
        from cryptography.hazmat.primitives import hashes
        from cryptography.hazmat.backends import default_backend
        from cryptography.hazmat.primitives.asymmetric import rsa
        from cryptography.hazmat.primitives import serialization
        import datetime
        
        # Generate private key
        key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
            backend=default_backend()
        )
        
        # Create certificate
        subject = issuer = x509.Name([
            x509.NameAttribute(NameOID.COMMON_NAME, u"localhost"),
        ])
        
        cert = x509.CertificateBuilder().subject_name(
            subject
        ).issuer_name(
            issuer
        ).public_key(
            key.public_key()
        ).serial_number(
            x509.random_serial_number()
        ).not_valid_before(
            datetime.datetime.utcnow()
        ).not_valid_after(
            datetime.datetime.utcnow() + datetime.timedelta(days=30)
        ).add_extension(
            x509.SubjectAlternativeName([
                x509.DNSName(u"localhost"),
                x509.IPAddress(get_local_ip()),
            ]),
            critical=False,
        ).sign(key, hashes.SHA256(), default_backend())
        
        # Write certificate and key to files
        with open("server.crt", "wb") as f:
            f.write(cert.public_bytes(serialization.Encoding.PEM))
        
        with open("server.key", "wb") as f:
            f.write(key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.PKCS8,
                encryption_algorithm=serialization.NoEncryption()
            ))
        
        return True
    except ImportError:
        print("cryptography package not available. Using simple SSL context.")
        return False

def main():
    PORT = 8443
    local_ip = get_local_ip()
    
    print("🚀 Starting AI Interview Assistant Server...")
    print(f"📍 Local IP: {local_ip}")
    print(f"🔒 Port: {PORT}")
    
    # Change to the directory containing the web files
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Create SSL certificate if cryptography is available
    cert_created = create_ssl_cert()
    
    Handler = http.server.SimpleHTTPRequestHandler
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        # Enable HTTPS
        if cert_created and os.path.exists("server.crt") and os.path.exists("server.key"):
            context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
            context.load_cert_chain("server.crt", "server.key")
            httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
            protocol = "https"
        else:
            # Fallback to simple SSL context
            context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
            context.check_hostname = False
            context.verify_mode = ssl.CERT_NONE
            httpd.socket = ssl.wrap_socket(httpd.socket, 
                                         certfile=None,
                                         keyfile=None,
                                         server_side=True,
                                         cert_reqs=ssl.CERT_NONE,
                                         ssl_version=ssl.PROTOCOL_TLS,
                                         do_handshake_on_connect=False)
            protocol = "https"
    
        print(f"\n✅ Server running!")
        print(f"🌐 Access from your computer: {protocol}://localhost:{PORT}")
        print(f"📱 Access from your phone: {protocol}://{local_ip}:{PORT}")
        print(f"\n🧪 Test page: {protocol}://{local_ip}:{PORT}/test.html")
        print(f"🎤 Main app: {protocol}://{local_ip}:{PORT}/index.html")
        print(f"\n⚠️  Note: You may see a security warning. Click 'Advanced' → 'Proceed anyway'")
        print(f"💡 Make sure your phone is on the same WiFi network!")
        print(f"\n🛑 Press Ctrl+C to stop the server")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n👋 Server stopped!")

if __name__ == "__main__":
    main()