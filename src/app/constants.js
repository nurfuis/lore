export const DEFAULT_TEMPLATES = {
  template: {
    world: {
      name: { label: 'Name', type: 'text' },
      description: { label: 'Description', type: 'textarea' },
      creator: { label: 'Creator', type: 'text' },
    },
    creature: {
      name: { label: 'Name', type: 'text' },
      description: { label: 'Description', type: 'textarea' },
      species: { label: 'Species', type: 'text' },
      abilities: { label: 'Abilities', type: 'textarea' },
    },
    item: {
      name: { label: 'Name', type: 'text' },
      description: { label: 'Description', type: 'textarea' },
      type: { label: 'Type', type: 'text' },
      rarity: {
        label: 'Rarity',
        type: 'select',
        options: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'],
      },
    },
  },
};
