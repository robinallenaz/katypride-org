export default {
  name: 'is-public',
  handler: (context) => {
    // Always allow public access
    return true;
  },
};
