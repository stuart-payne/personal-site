import { readdir, readFile } from "fs/promises";
import { join } from 'path'
import matter from 'gray-matter'
import type { GrayMatterFile } from 'gray-matter';

const POSTS_PATH = "_posts"

export const getPostNames  = async (): Promise<string[]> => {
    return await readdir(POSTS_PATH);
}

export const getFrontMatterForAllPosts = async (): Promise<GrayMatterFile<string>[]> => {
	const postNames = await getPostNames();
	const posts: string[] = []; 
	for(const postName of postNames) {
		posts.push(await readFile(join(POSTS_PATH, postName), 'utf8'));
	}
	const frontMatterArray: GrayMatterFile<string>[] = [];
	for(const post of posts) {
		frontMatterArray.push(matter(post));
	}
	return frontMatterArray;
}
