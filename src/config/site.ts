/**
 * @file This file contains the site configuration.
 * @exports siteConfig
 * @exports SiteConfig
 */

/**
 * The site configuration object.
 * @property {string} name - The name of the site.
 * @property {string} url - The URL of the site.
 * @property {string} ogImage - The URL of the Open Graph image for the site.
 * @property {string} description - A description of the site.
 * @property {object} links - Links to social media and other sites.
 * @property {string} links.twitter - The URL of the site's Twitter profile.
 * @property {string} links.github - The URL of the site's GitHub repository.
 */
export const siteConfig = {
  name: "GitLegend",
  url: "https://www.gitlegend.com",
  ogImage: "https://www.gitlegend.com/og.jpg",
  description:
    "Understand Your Past. Build Your Future.",
  links: {
    twitter: "https://twitter.com/gitlegend",
    github: "https://github.com/gitlegend/gitlegend",
  },
}

/**
 * The type of the site configuration object.
 * @type {typeof siteConfig}
 */
export type SiteConfig = typeof siteConfig
