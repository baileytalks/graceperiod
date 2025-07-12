import { Client } from "@notionhq/client";

// Initialize Notion client
export const notion = new Client({
    auth: process.env.NOTION_INTEGRATION_SECRET!,
});

// Extract the page ID from the Notion page URL
function extractPageIdFromUrl(pageUrl: string): string {
    const match = pageUrl.match(/([a-f0-9]{32})(?:[?#]|$)/i);
    if (match && match[1]) {
        return match[1];
    }

    throw Error("Failed to extract page ID");
}

export const NOTION_PAGE_ID = extractPageIdFromUrl(process.env.NOTION_PAGE_URL!);

/**
 * Lists all child databases contained within NOTION_PAGE_ID
 */
export async function getNotionDatabases() {
    const childDatabases = [];

    try {
        let hasMore = true;
        let startCursor: string | undefined = undefined;

        while (hasMore) {
            const response = await notion.blocks.children.list({
                block_id: NOTION_PAGE_ID,
                start_cursor: startCursor,
            });

            for (const block of response.results) {
                if ('type' in block && block.type === "child_database") {
                    const databaseId = block.id;

                    try {
                        const databaseInfo = await notion.databases.retrieve({
                            database_id: databaseId,
                        });

                        childDatabases.push(databaseInfo);
                    } catch (error) {
                        console.error(`Error retrieving database ${databaseId}:`, error);
                    }
                }
            }

            hasMore = response.has_more;
            startCursor = response.next_cursor || undefined;
        }

        return childDatabases;
    } catch (error) {
        console.error("Error listing child databases:", error);
        throw error;
    }
}

// Find a Notion database with the matching title
export async function findDatabaseByTitle(title: string) {
    const databases = await getNotionDatabases();

    for (const db of databases) {
        if ('title' in db && db.title && Array.isArray(db.title) && db.title.length > 0) {
            const dbTitle = db.title[0]?.plain_text?.toLowerCase() || "";
            if (dbTitle === title.toLowerCase()) {
                return db;
            }
        }
    }

    return null;
}

// Get all posts from the Notion database
export async function getPosts() {
    try {
        // The NOTION_PAGE_ID is actually a database ID, so query it directly
        const response = await notion.databases.query({
            database_id: NOTION_PAGE_ID,
            sorts: [
                {
                    property: "PublishedDate",
                    direction: "descending"
                }
            ]
        });

        return response.results.map((page: any) => {
            const properties = page.properties;
            const coverImage = page.cover?.external?.url || page.cover?.file?.url || null;

            return {
                id: page.id,
                title: properties.Title?.title?.[0]?.plain_text || "Untitled Post",
                body: properties.Body?.rich_text?.[0]?.plain_text || "",
                tags: properties.Tags?.multi_select?.map((tag: any) => tag.name) || [],
                publishedDate: properties.PublishedDate?.date?.start || null,
                url: page.url,
                coverImage: coverImage
            };
        });
    } catch (error) {
        console.error("Error fetching posts from Notion:", error);
        return [];
    }
}