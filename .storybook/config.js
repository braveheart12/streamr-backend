
import { configure } from '@storybook/react'

function loadStories() {
  require('../web-app/react-app/stories')
}

configure(loadStories, module)
