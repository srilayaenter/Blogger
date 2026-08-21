import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import eslintConfigPrettier from "eslint-config-prettier";

const eslintConfig = [...nextCoreWebVitals, eslintConfigPrettier];

export default eslintConfig;
