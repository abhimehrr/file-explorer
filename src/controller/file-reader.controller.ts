import { Request, Response } from "express";
import path from "path";
import fs from "fs/promises";

// Interfaces
export interface FileReaderProps {
  dirName?: string;
  dirPath: string;
  ignoreDirs?: string[];
}

export interface File {
  name: string;
  type: "file" | "folder";
  size: number | null;
  path: string;
  ext?: string;
  children?: File[];
}

export const fileReader = (props: FileReaderProps[]) => {
  return async (_: Request, res: Response) => {
    // Read the directories
    const directories = await Promise.all(props.map(readFiles));

    // Return the directories
    return res.status(200).json({
      directories: props.reduce(
        (acc, prop, idx) => ({
          ...acc,
          [prop.dirName || idx]: directories[idx],
        }),
        {}
      ),
    });
  };
};

/**
 * @param dirPath - The path to the directory to read
 * @returns - The files in the directory recursively
 */
const readFiles = async ({ dirPath, ignoreDirs }: FileReaderProps) => {
  try {
    // Read the directory
    const files = await fs.readdir(dirPath, {
      withFileTypes: true,
      encoding: "utf-8",
    });

    // Map the files
    const result: File[] = [];

    for (let file of files) {
      // If the file is in the ignore list then skip
      if (file.isDirectory() && ignoreDirs?.includes(file.name)) continue;

      // Get the entry path
      const entryPath = path.join(dirPath, file.name);

      // If the file is a directory then check for children
      if (file.isDirectory()) {
        result.push({
          type: "folder",
          name: file.name,
          size: null,
          path: entryPath,
          children: await readFiles({ dirPath: entryPath, ignoreDirs }),
        });
      } else {
        // If the file is a file then get the size
        const { size } = await fs.stat(entryPath);

        result.push({
          type: "file",
          name: file.name,
          size,
          ext: path.extname(file.name),
          path: entryPath,
        });
      }
    }

    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
};
