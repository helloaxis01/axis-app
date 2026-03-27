function getReact() {
  const ReactRef = typeof window !== "undefined" ? window.React : null;
  if (!ReactRef) {
    throw new Error("React global not found. Ensure React is loaded before auth-bundle.js.");
  }
  return ReactRef;
}

export const useState = (...args) => getReact().useState(...args);
export const useEffect = (...args) => getReact().useEffect(...args);

const ReactProxy = new Proxy(
  {},
  {
    get(_target, prop) {
      return getReact()[prop];
    },
  }
);

export default ReactProxy;
