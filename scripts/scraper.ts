import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Configuration
const SEARCH_QUERY = "cat:cs.AI";
const MAX_RESULTS = 5;
const INTERVAL_MS = 60 * 60 * 1000; // 1 hour
const DELAY_MS = 3000; // 3 seconds delay for rate limiting

async function fetchArxivPapers() {
    const url = `http://export.arxiv.org/api/query?search_query=${SEARCH_QUERY}&start=0&max_results=${MAX_RESULTS}&sortBy=submittedDate&sortOrder=descending`;
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Akshon-Scraper/1.0 (mailto:admin@akshon.org)'
        }
    });

    if (response.status === 429) {
        console.warn("⚠️ Rate limit hit (429) while fetching paper list. Waiting...");
        await new Promise(resolve => setTimeout(resolve, 10000));
        return [];
    }

    const text = await response.text();

    // Simple parsing of entries
    const entries = text.split("<entry>").slice(1);

    const papers = [];

    for (const entry of entries) {
        const titleMatch = entry.match(/<title>([^<]+)<\/title>/);
        const idMatch = entry.match(/<id>([^<]+)<\/id>/);

        if (titleMatch && idMatch) {
            const title = titleMatch[1].replace(/\n/g, " ").trim();
            const idUrl = idMatch[1]; // e.g. http://arxiv.org/abs/2101.12345
            const pdfUrl = idUrl.replace("/abs/", "/pdf/") + ".pdf";
            // Sanitize filename
            const filename = title.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 100) + ".pdf";

            papers.push({ title, pdfUrl, filename });
        }
    }

    return papers;
}

async function runScraper() {
    // Dynamically import to ensure env vars are loaded first
    let uploadToCorpus;
    try {
        const module = await import("../lib/gcp");
        uploadToCorpus = module.uploadToCorpus;
    } catch (e) {
        console.warn("⚠️ Could not load GCP module (likely due to missing credentials). Running in simulation mode.");
        uploadToCorpus = async (filename, content) => {
            console.log(`[SIMULATION] Uploading ${filename} (Size: ${content.length})`);
        };
    }

    console.log("🚀 Starting GCP Corpus Scraper Service...");
    console.log(`📡 Monitoring: ${SEARCH_QUERY}`);

    while (true) {
        try {
            console.log(`\n⏰ [${new Date().toISOString()}] Checking for new papers...`);
            const papers = await fetchArxivPapers();
            console.log(`📄 Found ${papers.length} recent papers.`);

            for (const paper of papers) {
                console.log(`   ⬇️ Processing: ${paper.title}`);

                // Rate limiting delay
                await new Promise(resolve => setTimeout(resolve, DELAY_MS));

                try {
                    // Check if we can fetch the PDF
                    const res = await fetch(paper.pdfUrl, {
                        headers: {
                            'User-Agent': 'Akshon-Scraper/1.0 (mailto:admin@akshon.org)'
                        }
                    });

                    if (res.status === 429) {
                         console.warn(`   ⚠️ Rate limit hit (429) for ${paper.title}. Skipping.`);
                         continue;
                    }

                    if (res.ok) {
                        const buffer = await res.arrayBuffer();
                        await uploadToCorpus(paper.filename, Buffer.from(buffer));
                        // uploadToCorpus logs success
                    } else {
                        console.warn(`   ⚠️ Failed to download PDF: ${res.statusText}`);
                    }
                } catch (err) {
                    console.error(`   ❌ Error downloading/uploading ${paper.filename}:`, err);
                }
            }

        } catch (error) {
            console.error("❌ Scraper Loop Error:", error);
        }

        console.log(`💤 Sleeping for ${INTERVAL_MS / 1000 / 60} minutes...`);
        await new Promise(resolve => setTimeout(resolve, INTERVAL_MS));
    }
}

// Execute
runScraper();
