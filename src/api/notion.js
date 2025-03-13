import { Client } from "@notionhq/client";
import { NotionAPI } from "notion-client";
import { getPageTitle, getPageProperty } from "notion-utils";

const notionClient = new Client({ auth: process.env.NOTION_TOKEN });
const notionAPI = new NotionAPI();

export async function getPosts() {
  const response = await notionClient.databases.query({
    database_id: process.env.NOTION_DATABASE_ID,
    filter: {
      property: "Status",
      select: {
        equals: "Published",
      },
    },
    sorts: [
      {
        property: "Date",
        direction: "descending",
      },
    ],
  });

  return response.results.map(page => {
    return {
      id: page.id,
      title: page.properties.Title.title[0]?.plain_text || "Untitled",
      slug: page.properties.Slug.rich_text[0]?.plain_text || page.id,
      date: page.properties.Date.date?.start || new Date().toISOString(),
      tags: page.properties.Tags.multi_select.map(tag => tag.name),
      category: page.properties.Category.select?.name || "Uncategorized",
      summary: page.properties.Summary.rich_text[0]?.plain_text || "",
      thumbnail: page.properties.Thumbnail.url || "",
    };
  });
}

export async function getPostContent(pageId) {
  const recordMap = await notionAPI.getPage(pageId);
  return recordMap;
}
