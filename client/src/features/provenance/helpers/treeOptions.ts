// What the tree draws. Both on by default.
export interface TreeOptions {
  showFilesOnlyStages: boolean; // stages that have files but no ShotGrid task
  showReviews: boolean;
}

export const defaultTreeOptions: TreeOptions = {
  showFilesOnlyStages: true,
  showReviews: true,
};
