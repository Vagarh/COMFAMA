import { readFileSync } from "fs";
import { join } from "path";
import type { EDAData, ModelsData, AnomaliesData, ClusteringData } from "@/types/fraud";

function readJSON<T>(filename: string): T {
  const filePath = join(process.cwd(), "public", "data", filename);
  const content = readFileSync(filePath, "utf-8");
  return JSON.parse(content) as T;
}

export const loadEDA = (): Promise<EDAData> => Promise.resolve(readJSON<EDAData>("eda.json"));
export const loadModels = (): Promise<ModelsData> => Promise.resolve(readJSON<ModelsData>("models.json"));
export const loadAnomalias = (): Promise<AnomaliesData> => Promise.resolve(readJSON<AnomaliesData>("anomalias.json"));
export const loadClustering = (): Promise<ClusteringData> => Promise.resolve(readJSON<ClusteringData>("clustering.json"));
