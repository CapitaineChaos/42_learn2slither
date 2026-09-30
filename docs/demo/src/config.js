// Options de l'écran de démarrage. Les modules du cours les lisent à leur
// import, donc app.js n'est chargé qu'après Démarrer, une fois les options
// fixées.

export const OPTIONS = [
  {
    key: 'method',
    label: 'Fonction Q',
    choices: [
      { value: 'table', label: 'Table Q' },
      { value: 'network', label: 'Réseau de neurones' },
    ],
    value: 'table',
  },
];

export const config = Object.fromEntries(OPTIONS.map(({ key, value }) => [key, value]));
