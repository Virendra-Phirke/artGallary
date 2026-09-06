import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { getDb, schema } from "../src/db/index";
import { getMediaConfig } from "../src/modules/media/media.config";
import ImageKit from "imagekit";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

async function inspect() {
  console.log("=== INSPECTING CURRENT MEDIA CONFIG & STORAGE ===");
  const config = getMediaConfig();
  console.log("ImageKit configured:", config.imagekit.isConfigured, "Endpoint:", config.imagekit.urlEndpoint);
  console.log("Cloudflare configured:", config.cloudflare.isConfigured, "Bucket:", config.cloudflare.bucketName, "PublicUrl:", config.cloudflare.publicUrl);

  // 1. Check ImageKit remote files
  if (config.imagekit.isConfigured) {
    try {
      const ik = new ImageKit({
        publicKey: config.imagekit.publicKey,
        privateKey: config.imagekit.privateKey,
        urlEndpoint: config.imagekit.urlEndpoint,
      });
      const files = await ik.listFiles({ limit: 50 });
      console.log(`\nImageKit files found (${files.length}):`);
      for (const f of files) {
        console.log(` - [${f.fileId}] ${f.name}`);
        console.log(`   URL: ${f.url}`);
        console.log(`   Path: ${f.filePath}`);
      }
    } catch (e: any) {
      console.error("Error listing ImageKit files:", e.message);
    }
  }

  // 2. Check Cloudflare R2
  if (config.cloudflare.isConfigured) {
    try {
      const s3 = new S3Client({
        region: "auto",
        endpoint: `https://${config.cloudflare.accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: config.cloudflare.accessKeyId,
          secretAccessKey: config.cloudflare.secretAccessKey,
        },
      });
      const cmd = new ListObjectsV2Command({
        Bucket: config.cloudflare.bucketName,
        MaxKeys: 50,
      });
      const res = await s3.send(cmd);
      const contents = res.Contents || [];
      console.log(`\nCloudflare R2 objects found (${contents.length}):`);
      for (const o of contents) {
        console.log(` - ${o.Key} (size: ${o.Size})`);
      }
    } catch (e: any) {
      console.error("Error listing Cloudflare R2 objects:", e.message);
    }
  }

  // 3. Check DB records
  const db = getDb();
  if (db) {
    console.log("\n=== DATABASE MEDIA TABLE ===");
    const mediaRows = await db.select().from(schema.media);
    console.log(`Total rows in media table: ${mediaRows.length}`);
    for (const m of mediaRows) {
      console.log(` - [${m.provider}] ${m.id} | ${m.fileName} | ${m.fileUrl}`);
    }

    console.log("\n=== DATABASE ARTWORKS ===");
    const artworks = await db.select().from(schema.artworks);
    for (const a of artworks) {
      console.log(` - ${a.title} (${a.slug}): ${a.coverImageUrl}`);
    }

    console.log("\n=== DATABASE ARTWORK IMAGES ===");
    const artworkImgs = await db.select().from(schema.artworkImages);
    for (const ai of artworkImgs) {
      console.log(` - Artwork ${ai.artworkId}: ${ai.imageUrl}`);
    }

    console.log("\n=== DATABASE COLLECTIONS ===");
    const collections = await db.select().from(schema.collections);
    for (const c of collections) {
      console.log(` - ${c.title} (${c.slug}): ${c.coverImageUrl}`);
    }

    console.log("\n=== DATABASE EXHIBITIONS ===");
    const exhibitions = await db.select().from(schema.exhibitions);
    for (const e of exhibitions) {
      console.log(` - ${e.title} (${e.slug}): ${e.coverImageUrl}`);
    }
  }
}

inspect()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
