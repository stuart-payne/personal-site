import { readdir } from "fs/promises";

const POSTS_PATH = "_posts"

export const getPostNames = async () => {
    const fileNames = await readdir(POSTS_PATH);
    return fileNames;
}