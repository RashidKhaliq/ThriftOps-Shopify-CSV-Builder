import { onRequestGet as __api_helper_js_onRequestGet } from "C:\\Users\\rashid.khaliq\\Downloads\\ThriftOps_Shopify_CSV_Builder_v7\\functions\\api\\helper.js"

export const routes = [
    {
      routePath: "/api/helper",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_helper_js_onRequestGet],
    },
  ]