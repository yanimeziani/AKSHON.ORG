# AKSHON Compliance & Security Audit Framework

## 1. Data Residency & Sovereignty
- **Provider**: Google Cloud Platform (GCP).
- **Region**: Configured for low-latency access and high availability.
- **Storage**: Non-public buckets. All objects are private by default.

## 2. Secure Serving Layer
- **Signed URLs**: AKSHON uses V4 Signed URLs for all research downloads.
- **TTL**: 15 Minutes. Links expire automatically to prevent URL sharing.
- **Auditing**: Every call to `getSecureUrl()` is logged with a timestamp and the requested resource.

## 3. Deception Technology (Honeypots)
- **Traps**: Fake directories (`/secrets`, `/admin`) populated with attractive but useless "token" files.
- **Trigger**: Scripted alerts monitor access to these specific paths.
- **Defense**: Any IP scanning these directories is flagged for immediate review/blocking.

## 4. Compliance Controls
- **GDPR**: No PII is stored in the research corpus. Access logs store minimal metadata for security purposes.
- **SOC2 Ready**: Implements least-privileged access and automated audit trails for data retrieval.
- **Integrity**: MD5 hashes are verified on every upload to ensure paper authenticity.

## 5. Audit Logging implementation
- Logs are currently output to the server console and structured for ingestion by Cloud Logging (GCP).
- Implementation found in `lib/gcp.ts`.
