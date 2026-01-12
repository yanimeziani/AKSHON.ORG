# Resonance-Biomimetic Security Protocol (RBSP)

## 1. Mathematical Foundation: The Resonance Theorem
Security is not binary; it is harmonic. The RBSP ensures that only entities in "resonance" with the project's core frequency can access the Ollama compute cluster.

### Harmonic Attestation
Access is granted when the client provides a `Transient-Resonance-Signature` (TRS).
The TRS is calculated as:
$$ TRS = \mathcal{H}(T \oplus P \oplus K) $$
Where:
- $\mathcal{H}$ is the SHA-256 cryptographic hash function.
- $T$ is the current TAI-64 timestamp (to prevent replay attacks).
- $P$ is the GCP Project ID.
- $K$ is the Kinetic Secret (a private salt shared within the Akshon network).

## 2. Biomimetic Architecture: The Membrane Proxy
The infrastructure mimics biological cell membranes (Selective Permeability).

### Features:
- **Refractory Period**: Sudden bursts of unauthorized requests trigger a "neuronal exhaustion" mode, where the firewall hardens indefinitely for the offending IP (mimicking a biological hyper-polarization).
- **Synaptic Trust**: Repeated successful resonance matches increase the "synaptic weight" of an IP, allowing higher throughput (facilitating information fluid arbitrage).
- **Apoptosis**: If the instance detects a breach (integrity mismatch), it initiates self-termination to protect the corpus.

## 3. Implementation
The protocol is enforced by the `resonance-proxy.py` layer, which sits in front of the local Ollama daemon (Port 11434).
