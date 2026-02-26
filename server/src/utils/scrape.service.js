import axios from 'axios';
import * as cheerio from 'cheerio';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

export const scrapeSyllabus = async (url) => {
    try {
        const response = await axios.get(url, {
            responseType: 'arraybuffer', // Handle both text and binary (PDF)
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const contentType = response.headers['content-type']?.toLowerCase() || '';
        const buffer = Buffer.from(response.data);

        if (contentType.includes('application/pdf')) {
            // Handle PDF
            const data = await pdf(buffer);
            // Clean up text: remove excessive whitespace
            return data.text.replace(/\s+/g, ' ').trim().slice(0, 20000); // Limit context size
        } else {
            // Handle HTML
            const html = buffer.toString('utf-8');
            const $ = cheerio.load(html);

            // Remove unwanted elements
            $('script, style, nav, footer, iframe, header').remove();

            // Strategies to find main content
            let text = '';

            // 1. Try common main content selectors
            const mainSelectors = ['main', 'article', '#content', '#main', '.content', '.main'];
            for (const selector of mainSelectors) {
                if ($(selector).length > 0) {
                    text = $(selector).text();
                    break;
                }
            }

            // 2. If no main content found, fallback to body
            if (!text.trim()) {
                text = $('body').text();
            }

            // 3. Clean up text
            return text.replace(/\s+/g, ' ').trim().slice(0, 20000);
        }
    } catch (error) {
        console.error("Scraping error:", error.message);
        throw new Error(`Failed to fetch syllabus from URL: ${error.message}`);
    }
};
