declare module 'virtual:commit-hash' {
  /** `git describe` of the build, with '-dirty' when built from uncommitted work. */
  const commitHash: string;
  export default commitHash;
}
