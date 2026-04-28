export interface FileFetchData {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: "file";
  content: string;
  encoding: "base64";
  _links: {
    self: string;
    git: string;
    html: string;
  };
}

type Social = "twitter" | "bluesky" | "linkedin" | "instagram" | "facebook";

type SocialAccountsType = {
  displayName: string;
  url: string;
};

export interface TeamData {
  name: string;
  login: string;
  avatarUrl: string;
  pronouns: string;
  location: string;
  websiteUrl: string | null;
  sponsorsListing: string;
  socialAccounts: { [x in Social]?: SocialAccountsType };
}

export interface LatestRelease {
  tag_name: string;
  name: string;
  created_at: string;
  updated_at: string;
  published_at: string;
  assets: any;
  tarball_url: string;
  zipball_url: string;
  body: string;
}
