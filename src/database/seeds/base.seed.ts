export interface Seed {
    order: number;
    name: string;
    run: () => Promise<void>;
}