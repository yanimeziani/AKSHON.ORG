import http.server
import socketserver
import urllib.request
import hashlib
import time
import os

PORT = 8080
OLLAMA_URL = "http://localhost:11434"
SECRET_KINETIC_KEY = os.environ.get("KINETIC_SECRET", "AKSHON_RESONANCE_2026")
PROJECT_ID = os.environ.get("GCP_PROJECT_ID", "stellar-chariot-477113-j0")

class ResonanceHandler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        # 1. Biomimetic Membrane Check: Validate Resonance Signature
        signature = self.headers.get('X-Resonance-Signature')
        timestamp = self.headers.get('X-Resonance-Timestamp')
        
        if not signature or not timestamp:
            self.send_error(403, "Disharmonic Connection: Missing Resonance Data")
            return

        # 2. Mathematical Verification
        expected_msg = f"{timestamp}{PROJECT_ID}{SECRET_KINETIC_KEY}"
        expected_sig = hashlib.sha256(expected_msg.encode()).hexdigest()

        if signature != expected_sig:
            print(f"[SECURITY] - Refractory Block: Invalid signature from {self.client_address}")
            self.send_error(403, "Resonance Mismatch: Frequency out of alignment")
            return

        # 3. Replay Attack Prevention (Maths)
        try:
            ts_float = float(timestamp)
            if abs(time.time() - ts_float) > 30: # 30s window
                self.send_error(403, "Temporal Decay: Resonance expired")
                return
        except ValueError:
            self.send_error(400, "Invalid Temporal Format")
            return

        # 4. Proxy to Ollama
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        req = urllib.request.Request(
            f"{OLLAMA_URL}{self.path}",
            data=post_data,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        
        try:
            with urllib.request.urlopen(req) as response:
                self.send_response(response.getcode())
                for header, value in response.getheaders():
                    self.send_header(header, value)
                self.end_headers()
                self.wfile.write(response.read())
        except Exception as e:
            self.send_error(502, f"Ollama Unreachable: {str(e)}")

    def do_GET(self):
        # Allow GET / to check health, but keep it minimal
        if self.path == "/":
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"AKSHON Resonance Membrane: ONLINE")
        else:
            self.send_error(404)

with socketserver.TCPServer(("", PORT), ResonanceHandler) as httpd:
    print(f"Resonance Membrane active on port {PORT}")
    httpd.serve_forever()
