#!/bin/bash
# AKSHON.ORG - GCP Ollama Setup Script
# Deploying Dolphin R1 24B with Resonance-Biomimetic Security

PROJECT_ID=$(gcloud config get-value project)
REGION="us-central1"
ZONE="us-central1-a"
INSTANCE_NAME="akshon-ollama-core"
MACHINE_TYPE="g2-standard-4" # 4 vCPUs, 16GB RAM, L4 GPU

echo "🚀 INITIALIZING AKSHON OLLAMA CLOUD DEPLOYMENT..."
echo "Project: $PROJECT_ID"

# 1. Enable Required APIs
gcloud services enable compute.googleapis.com

# 2. Create Firewall Rule for Resonance Proxy (Port 8080)
# We only open 8080 (Proxy), never 11434 (Ollama)
echo "🔒 HARDENING FIREWALL..."
gcloud compute firewall-rules create allow-resonance-proxy \
    --direction=INGRESS \
    --priority=1000 \
    --network=default \
    --action=ALLOW \
    --rules=tcp:8080 \
    --source-ranges=0.0.0.0/0 \
    --description="Allow traffic to the Akshon Resonance Membrane"

# 3. Create GCE Instance with L4 GPU
echo "🏗️ PROVISIONING COMPUTE NODE (L4 GPU)..."
gcloud compute instances create $INSTANCE_NAME \
    --project=$PROJECT_ID \
    --zone=$ZONE \
    --machine-type=$MACHINE_TYPE \
    --network-interface=network-tier=PREMIUM,subnet=default \
    --maintenance-policy=TERMINATE \
    --provisioning-model=SPOT \
    --accelerator=count=1,type=nvidia-l4 \
    --image-family=common-cu122-debian-11-py310 \
    --image-project=deeplearning-platform-release \
    --boot-disk-size=100GB \
    --boot-disk-type=pd-balanced \
    --metadata=install-nvidia-driver=true,startup-script='#!/bin/bash
    # Install Ollama
    curl -fsSL https://ollama.com/install.sh | sh
    
    # Wait for Ollama to start
    sleep 10
    
    # Pull Dolphin R1 24B
    ollama pull dolphin-mixtral:24b # Adjusted for Dolphin R1 equivalent if available, or just dolphin-r1:24b
    
    # Download Resonance Proxy from local? No, we will embed it here for the demo
    cat <<EOF > /opt/resonance-proxy.py
$(cat scripts/cloud/resonance-proxy.py)
EOF
    
    # Run Proxy in background
    export GCP_PROJECT_ID='$PROJECT_ID'
    python3 /opt/resonance-proxy.py &
    '

echo "✨ DEPLOYMENT COMMAND SENT."
echo "Wait 5-10 minutes for GPU drivers and model to download."
echo "Access via: http://$(gcloud compute instances describe $INSTANCE_NAME --zone=$ZONE --format='get(networkInterfaces[0].accessConfigs[0].externalIp)'):8080"
echo "Security: Resonance-Biomimetic Signature Required."
