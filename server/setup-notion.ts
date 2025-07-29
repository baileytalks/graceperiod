import { Client } from "@notionhq/client";
import { notion, NOTION_PAGE_ID, getNotionDatabases } from "./notion";

// Environment variables validation
if (!notion || !NOTION_PAGE_ID) {
    throw new Error("Notion environment variables are not configured.");
}

async function setupNotionDatabase() {
    try {
        console.log("Setting up Notion database for Grace Period posts...");
        console.log("Page ID:", NOTION_PAGE_ID);

        // First, let's try to access the page directly
        try {
            const page = await notion!.pages.retrieve({ page_id: NOTION_PAGE_ID! });
            console.log("✓ Successfully connected to Notion page");
        } catch (error) {
            console.error("✗ Failed to access Notion page:", error);
            console.log("\nPlease ensure:");
            console.log("1. The Notion integration has access to the page");
            console.log("2. The page URL is correct");
            console.log("3. The integration has the right permissions");
            return;
        }

        // Check for existing databases
        const databases = await getNotionDatabases();
        console.log(`Found ${databases.length} child databases`);

        // Look for a posts database
        let postsDb = null;
        for (const db of databases) {
            if ('title' in db && db.title && Array.isArray(db.title) && db.title.length > 0) {
                const dbTitle = db.title[0]?.plain_text?.toLowerCase() || "";
                console.log(`Found database: "${db.title[0]?.plain_text}"`);
                if (dbTitle.includes("post")) {
                    postsDb = db;
                    break;
                }
            }
        }

        if (!postsDb) {
            console.log("\nNo posts database found. Creating one...");
            
            // Create a posts database
            postsDb = await notion!.databases.create({
                parent: {
                    type: "page_id",
                    page_id: NOTION_PAGE_ID!
                },
                title: [
                    {
                        type: "text",
                        text: {
                            content: "Posts"
                        }
                    }
                ],
                properties: {
                    Title: {
                        title: {}
                    },
                    Body: {
                        rich_text: {}
                    },
                    Tags: {
                        multi_select: {
                            options: [
                                { name: "Music", color: "blue" },
                                { name: "Updates", color: "green" },
                                { name: "News", color: "orange" },
                                { name: "Personal", color: "purple" }
                            ]
                        }
                    },
                    PublishedDate: {
                        date: {}
                    }
                }
            });

            console.log("✓ Created Posts database");

            // Add a sample post
            await notion!.pages.create({
                parent: {
                    database_id: postsDb.id
                },
                properties: {
                    Title: {
                        title: [
                            {
                                text: {
                                    content: "Welcome to Grace Period"
                                }
                            }
                        ]
                    },
                    Body: {
                        rich_text: [
                            {
                                text: {
                                    content: "Thank you for joining the Grace Period community! Stay tuned for updates, new music, and behind-the-scenes content. This is just the beginning of our journey together."
                                }
                            }
                        ]
                    },
                    Tags: {
                        multi_select: [
                            { name: "Updates" },
                            { name: "Music" }
                        ]
                    },
                    PublishedDate: {
                        date: {
                            start: new Date().toISOString().split('T')[0]
                        }
                    }
                }
            });

            console.log("✓ Added sample post");
        } else {
            console.log("✓ Posts database already exists");
        }

        console.log("\nSetup complete! Your Grace Period website can now pull posts from Notion.");
        
    } catch (error) {
        console.error("Setup failed:", error);
    }
}

// Run the setup
setupNotionDatabase().then(() => {
    console.log("Notion setup finished!");
    process.exit(0);
}).catch(error => {
    console.error("Setup failed:", error);
    process.exit(1);
});