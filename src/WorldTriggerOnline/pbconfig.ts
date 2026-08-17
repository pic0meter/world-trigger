import { ContentRating, SourceInfo } from '@paperback/types'

export const WorldTriggerOnlineInfo: SourceInfo = {
  version: '1.0.0',
  name: 'World Trigger Online',
  icon: 'icon.png', // Add a 512x512 icon.png in the source folder if desired
  author: 'pic0meter',
  authorWebsite: 'https://github.com/pic0meter',
  description: 'Extension to read World Trigger from world-trigger-chapters.online',
  contentRating: ContentRating.EVERYONE,
  websiteBaseURL: 'https://world-trigger-chapters.online'
}
