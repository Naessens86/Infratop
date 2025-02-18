const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();

// Middleware
app.use(express.json());
app.use(express.static('.'));

// API endpoint to save content
app.post('/api/save-content', async (req, res) => {
    try {
        const content = req.body;
        await fs.writeFile(
            path.join(__dirname, 'content', 'content.json'),
            JSON.stringify(content, null, 2)
        );
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving content:', error);
        res.status(500).json({ error: 'Failed to save content' });
    }
});

// Create content directory if it doesn't exist
async function ensureContentDirectory() {
    const contentDir = path.join(__dirname, 'content');
    try {
        await fs.access(contentDir);
    } catch {
        await fs.mkdir(contentDir);
        // Create initial content.json if it doesn't exist
        const initialContent = {
            en: {
                hero: {
                    title: "The heart of your jobsite",
                    subtitle: "Rental & sales of construction site infrastructure equipment",
                    ctaText: "Explore Our Products"
                },
                products: {
                    title: "Our Products",
                    items: [
                        {
                            icon: "fa-car-battery",
                            title: "Battery Systems",
                            description: "Sustainable power solutions for your construction site needs"
                        }
                    ]
                },
                about: {
                    title: "About Us",
                    subtitle: "Infratop, at the heart of your projects",
                    content: "A new player that will support your projects from start to finish."
                }
            }
        };
        await fs.writeFile(
            path.join(contentDir, 'content.json'),
            JSON.stringify(initialContent, null, 2)
        );
    }
}

// Start server
const PORT = process.env.PORT || 3000;
ensureContentDirectory().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}); 