import { readdir, readFile } from "fs/promises";
import { join } from "path";
import matter from "gray-matter";
import type { GrayMatterFile } from "gray-matter";
import { PostMetaData } from "../pages";

const POSTS_PATH = "_posts";
const mdExtRemover = /(.md$)/;

export const getPostNames = async (): Promise<string[]> => {
    return await readdir(POSTS_PATH);
};

export const getPostNamesWithoutExt = async (): Promise<string[]> => {
    const postNames = await readdir(POSTS_PATH);
    return postNames.map((postName) => postName.replace(mdExtRemover, ""));
};

export const getAllPostMetaData = async (): Promise<PostMetaData[]> => {
    const postNames = await getPostNames();
    const posts: string[] = [];
    for (const postName of postNames) {
        posts.push(await readFile(join(POSTS_PATH, postName), "utf8"));
    }
    const frontMatterArray: GrayMatterFile<string>[] = [];
    for (const post of posts) {
        frontMatterArray.push(matter(post));
    }
    const postMetaData: PostMetaData[] = [];
    for (let i = 0; i < frontMatterArray.length; i++) {
        const { title, date } = frontMatterArray[i].data;
        postMetaData.push({
            title,
            date: date.toDateString(),
            link: `/posts/${postNames[i].replace(mdExtRemover, "")}`,
        });
    }
    return postMetaData;
};
