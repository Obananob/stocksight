// vite.config.ts
import { defineConfig } from "file:///C:/Users/USER/OneDrive/Documents/MOI%20DOCS/TOY_PROJECTS/STOCKSIGHT/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/USER/OneDrive/Documents/MOI%20DOCS/TOY_PROJECTS/STOCKSIGHT/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///C:/Users/USER/OneDrive/Documents/MOI%20DOCS/TOY_PROJECTS/STOCKSIGHT/node_modules/lovable-tagger/dist/index.js";
import { VitePWA } from "file:///C:/Users/USER/OneDrive/Documents/MOI%20DOCS/TOY_PROJECTS/STOCKSIGHT/node_modules/vite-plugin-pwa/dist/index.js";

// vite-pwa.config.ts
var pwaConfig = {
  registerType: "autoUpdate",
  includeAssets: ["favicon.png"],
  manifest: {
    name: "ShopCount - Inventory & Sales Tracking",
    short_name: "ShopCount",
    description: "Real-time inventory and sales tracking for small shop owners",
    theme_color: "#2ECC71",
    background_color: "#ffffff",
    display: "standalone",
    orientation: "portrait",
    start_url: "/",
    icons: [
      {
        src: "/favicon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
      }
    ]
  },
  workbox: {
    globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "supabase-cache",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24
            // 24 hours
          },
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      }
    ]
  },
  devOptions: {
    enabled: false
  }
};

// vite.config.ts
var __vite_injected_original_dirname = "C:\\Users\\USER\\OneDrive\\Documents\\MOI DOCS\\TOY_PROJECTS\\STOCKSIGHT";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA(pwaConfig)
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAidml0ZS1wd2EuY29uZmlnLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcVVNFUlxcXFxPbmVEcml2ZVxcXFxEb2N1bWVudHNcXFxcTU9JIERPQ1NcXFxcVE9ZX1BST0pFQ1RTXFxcXFNUT0NLU0lHSFRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXFVTRVJcXFxcT25lRHJpdmVcXFxcRG9jdW1lbnRzXFxcXE1PSSBET0NTXFxcXFRPWV9QUk9KRUNUU1xcXFxTVE9DS1NJR0hUXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9VU0VSL09uZURyaXZlL0RvY3VtZW50cy9NT0klMjBET0NTL1RPWV9QUk9KRUNUUy9TVE9DS1NJR0hUL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XHJcbmltcG9ydCB7IFZpdGVQV0EgfSBmcm9tICd2aXRlLXBsdWdpbi1wd2EnO1xyXG5pbXBvcnQgeyBwd2FDb25maWcgfSBmcm9tICcuL3ZpdGUtcHdhLmNvbmZpZyc7XHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xyXG4gIHNlcnZlcjoge1xyXG4gICAgaG9zdDogXCI6OlwiLFxyXG4gICAgcG9ydDogODA4MCxcclxuICB9LFxyXG4gIHBsdWdpbnM6IFtcclxuICAgIHJlYWN0KCksXHJcbiAgICBtb2RlID09PSBcImRldmVsb3BtZW50XCIgJiYgY29tcG9uZW50VGFnZ2VyKCksXHJcbiAgICBWaXRlUFdBKHB3YUNvbmZpZyksXHJcbiAgXS5maWx0ZXIoQm9vbGVhbiksXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXHJcbiAgICB9LFxyXG4gIH0sXHJcbn0pKTtcclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxVU0VSXFxcXE9uZURyaXZlXFxcXERvY3VtZW50c1xcXFxNT0kgRE9DU1xcXFxUT1lfUFJPSkVDVFNcXFxcU1RPQ0tTSUdIVFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcVVNFUlxcXFxPbmVEcml2ZVxcXFxEb2N1bWVudHNcXFxcTU9JIERPQ1NcXFxcVE9ZX1BST0pFQ1RTXFxcXFNUT0NLU0lHSFRcXFxcdml0ZS1wd2EuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9VU0VSL09uZURyaXZlL0RvY3VtZW50cy9NT0klMjBET0NTL1RPWV9QUk9KRUNUUy9TVE9DS1NJR0hUL3ZpdGUtcHdhLmNvbmZpZy50c1wiO2ltcG9ydCB7IFZpdGVQV0FPcHRpb25zIH0gZnJvbSAndml0ZS1wbHVnaW4tcHdhJztcclxuXHJcbmV4cG9ydCBjb25zdCBwd2FDb25maWc6IFBhcnRpYWw8Vml0ZVBXQU9wdGlvbnM+ID0ge1xyXG4gIHJlZ2lzdGVyVHlwZTogJ2F1dG9VcGRhdGUnLFxyXG4gIGluY2x1ZGVBc3NldHM6IFsnZmF2aWNvbi5wbmcnXSxcclxuICBtYW5pZmVzdDoge1xyXG4gICAgbmFtZTogJ1Nob3BDb3VudCAtIEludmVudG9yeSAmIFNhbGVzIFRyYWNraW5nJyxcclxuICAgIHNob3J0X25hbWU6ICdTaG9wQ291bnQnLFxyXG4gICAgZGVzY3JpcHRpb246ICdSZWFsLXRpbWUgaW52ZW50b3J5IGFuZCBzYWxlcyB0cmFja2luZyBmb3Igc21hbGwgc2hvcCBvd25lcnMnLFxyXG4gICAgdGhlbWVfY29sb3I6ICcjMkVDQzcxJyxcclxuICAgIGJhY2tncm91bmRfY29sb3I6ICcjZmZmZmZmJyxcclxuICAgIGRpc3BsYXk6ICdzdGFuZGFsb25lJyxcclxuICAgIG9yaWVudGF0aW9uOiAncG9ydHJhaXQnLFxyXG4gICAgc3RhcnRfdXJsOiAnLycsXHJcbiAgICBpY29uczogW1xyXG4gICAgICB7XHJcbiAgICAgICAgc3JjOiAnL2Zhdmljb24ucG5nJyxcclxuICAgICAgICBzaXplczogJzUxMng1MTInLFxyXG4gICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxyXG4gICAgICAgIHB1cnBvc2U6ICdhbnkgbWFza2FibGUnLFxyXG4gICAgICB9LFxyXG4gICAgXSxcclxuICB9LFxyXG4gIHdvcmtib3g6IHtcclxuICAgIGdsb2JQYXR0ZXJuczogWycqKi8qLntqcyxjc3MsaHRtbCxpY28scG5nLHN2Zyx3b2ZmLHdvZmYyfSddLFxyXG4gICAgcnVudGltZUNhY2hpbmc6IFtcclxuICAgICAge1xyXG4gICAgICAgIHVybFBhdHRlcm46IC9eaHR0cHM6XFwvXFwvLipcXC5zdXBhYmFzZVxcLmNvXFwvLiovaSxcclxuICAgICAgICBoYW5kbGVyOiAnTmV0d29ya0ZpcnN0JyxcclxuICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICBjYWNoZU5hbWU6ICdzdXBhYmFzZS1jYWNoZScsXHJcbiAgICAgICAgICBleHBpcmF0aW9uOiB7XHJcbiAgICAgICAgICAgIG1heEVudHJpZXM6IDUwLFxyXG4gICAgICAgICAgICBtYXhBZ2VTZWNvbmRzOiA2MCAqIDYwICogMjQsIC8vIDI0IGhvdXJzXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgY2FjaGVhYmxlUmVzcG9uc2U6IHtcclxuICAgICAgICAgICAgc3RhdHVzZXM6IFswLCAyMDBdLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgXSxcclxuICB9LFxyXG4gIGRldk9wdGlvbnM6IHtcclxuICAgIGVuYWJsZWQ6IGZhbHNlLFxyXG4gIH0sXHJcbn07XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBdVksU0FBUyxvQkFBb0I7QUFDcGEsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLHVCQUF1QjtBQUNoQyxTQUFTLGVBQWU7OztBQ0ZqQixJQUFNLFlBQXFDO0FBQUEsRUFDaEQsY0FBYztBQUFBLEVBQ2QsZUFBZSxDQUFDLGFBQWE7QUFBQSxFQUM3QixVQUFVO0FBQUEsSUFDUixNQUFNO0FBQUEsSUFDTixZQUFZO0FBQUEsSUFDWixhQUFhO0FBQUEsSUFDYixhQUFhO0FBQUEsSUFDYixrQkFBa0I7QUFBQSxJQUNsQixTQUFTO0FBQUEsSUFDVCxhQUFhO0FBQUEsSUFDYixXQUFXO0FBQUEsSUFDWCxPQUFPO0FBQUEsTUFDTDtBQUFBLFFBQ0UsS0FBSztBQUFBLFFBQ0wsT0FBTztBQUFBLFFBQ1AsTUFBTTtBQUFBLFFBQ04sU0FBUztBQUFBLE1BQ1g7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsY0FBYyxDQUFDLDJDQUEyQztBQUFBLElBQzFELGdCQUFnQjtBQUFBLE1BQ2Q7QUFBQSxRQUNFLFlBQVk7QUFBQSxRQUNaLFNBQVM7QUFBQSxRQUNULFNBQVM7QUFBQSxVQUNQLFdBQVc7QUFBQSxVQUNYLFlBQVk7QUFBQSxZQUNWLFlBQVk7QUFBQSxZQUNaLGVBQWUsS0FBSyxLQUFLO0FBQUE7QUFBQSxVQUMzQjtBQUFBLFVBQ0EsbUJBQW1CO0FBQUEsWUFDakIsVUFBVSxDQUFDLEdBQUcsR0FBRztBQUFBLFVBQ25CO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsWUFBWTtBQUFBLElBQ1YsU0FBUztBQUFBLEVBQ1g7QUFDRjs7O0FEN0NBLElBQU0sbUNBQW1DO0FBUXpDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxPQUFPO0FBQUEsRUFDekMsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1I7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLFNBQVMsaUJBQWlCLGdCQUFnQjtBQUFBLElBQzFDLFFBQVEsU0FBUztBQUFBLEVBQ25CLEVBQUUsT0FBTyxPQUFPO0FBQUEsRUFDaEIsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbXQp9Cg==
