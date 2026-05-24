// tree.js — Atlas folder structure (3 levels deep)
// Level 1 = book, Level 2 = chapter, Level 3 = page

window.ATLAS_TREE = [
  {
    id: 'js', label: 'JavaScript', icon: 'js', color: 'amber',
    children: [
      { id: 'js-ts', label: 'TypeScript', children: [
        { id: 'js-ts-types',    label: 'Types & Interfaces', tag: 'updated' },
        { id: 'js-ts-generics', label: 'Generics in Depth',  tag: 'current' },
        { id: 'js-ts-utility',  label: 'Utility Types' },
        { id: 'js-ts-narrow',   label: 'Type Narrowing' },
        { id: 'js-ts-decl',     label: 'Declaration Merging' },
      ]},
      { id: 'js-react', label: 'React', children: [
        { id: 'js-react-hooks',    label: 'Hooks Cookbook' },
        { id: 'js-react-suspense', label: 'Suspense & Concurrency', tag: 'new' },
        { id: 'js-react-server',   label: 'Server Components' },
        { id: 'js-react-perf',     label: 'Performance Patterns' },
      ]},
      { id: 'js-node', label: 'Node', children: [
        { id: 'js-node-streams', label: 'Streams' },
        { id: 'js-node-cluster', label: 'Cluster & Workers' },
        { id: 'js-node-async',   label: 'Async Patterns' },
      ]},
      { id: 'js-runtime', label: 'Runtime', children: [
        { id: 'js-runtime-event-loop', label: 'Event Loop' },
        { id: 'js-runtime-gc',         label: 'Garbage Collection' },
        { id: 'js-runtime-v8',         label: 'V8 Internals' },
      ]},
    ],
  },
  {
    id: 'net', label: 'Networking', icon: 'net', color: 'blue',
    children: [
      { id: 'net-ip', label: 'IP & Routing', children: [
        { id: 'net-ip-subnet', label: 'Subnetting & CIDR' },
        { id: 'net-ip-bgp',    label: 'BGP for Beginners' },
        { id: 'net-ip-ipv6',   label: 'IPv6 Cheatsheet' },
      ]},
      { id: 'net-dns', label: 'DNS', children: [
        { id: 'net-dns-records', label: 'Record Types' },
        { id: 'net-dns-resolve', label: 'Resolution Path' },
        { id: 'net-dns-dnssec',  label: 'DNSSEC' },
      ]},
      { id: 'net-http', label: 'HTTP', children: [
        { id: 'net-http-2',     label: 'HTTP/2 Multiplexing' },
        { id: 'net-http-3',     label: 'HTTP/3 & QUIC', tag: 'new' },
        { id: 'net-http-cache', label: 'Caching Headers' },
      ]},
      { id: 'net-tls', label: 'TLS', children: [
        { id: 'net-tls-hand',   label: 'Handshake' },
        { id: 'net-tls-cert',   label: 'Certificates' },
        { id: 'net-tls-mtls',   label: 'mTLS Setup' },
      ]},
    ],
  },
  {
    id: 'sys', label: 'Systems', icon: 'sys', color: 'green',
    children: [
      { id: 'sys-linux', label: 'Linux', children: [
        { id: 'sys-linux-bash',   label: 'Bash Power Moves' },
        { id: 'sys-linux-proc',   label: '/proc & /sys' },
        { id: 'sys-linux-systemd',label: 'systemd Units' },
        { id: 'sys-linux-perf',   label: 'perf & flamegraphs' },
      ]},
      { id: 'sys-docker', label: 'Docker', children: [
        { id: 'sys-docker-layer',  label: 'Layer Anatomy' },
        { id: 'sys-docker-compose',label: 'Compose Patterns' },
        { id: 'sys-docker-build',  label: 'BuildKit Tricks' },
      ]},
      { id: 'sys-k8s', label: 'Kubernetes', children: [
        { id: 'sys-k8s-pods',  label: 'Pod Lifecycle' },
        { id: 'sys-k8s-net',   label: 'Service Networking' },
        { id: 'sys-k8s-ingress', label: 'Ingress Recipes' },
      ]},
    ],
  },
  {
    id: 'algo', label: 'Algorithms', icon: 'algo', color: 'plum',
    children: [
      { id: 'algo-sort', label: 'Sorting', children: [
        { id: 'algo-sort-quick',  label: 'Quicksort' },
        { id: 'algo-sort-merge',  label: 'Mergesort' },
        { id: 'algo-sort-radix',  label: 'Radix & Counting' },
      ]},
      { id: 'algo-graph', label: 'Graphs', children: [
        { id: 'algo-graph-bfs',     label: 'BFS & DFS' },
        { id: 'algo-graph-dijkstra',label: 'Dijkstra' },
        { id: 'algo-graph-mst',     label: 'Minimum Spanning Tree' },
      ]},
      { id: 'algo-dp', label: 'Dynamic Programming', children: [
        { id: 'algo-dp-101',     label: 'DP 101' },
        { id: 'algo-dp-knapsack',label: 'Knapsack Family' },
      ]},
    ],
  },
  {
    id: 'db', label: 'Databases', icon: 'db', color: 'rust',
    children: [
      { id: 'db-pg', label: 'Postgres', children: [
        { id: 'db-pg-index',  label: 'Index Strategy' },
        { id: 'db-pg-vacuum', label: 'Vacuum & Bloat' },
        { id: 'db-pg-jsonb',  label: 'JSONB Queries' },
      ]},
      { id: 'db-redis', label: 'Redis', children: [
        { id: 'db-redis-data',   label: 'Data Structures' },
        { id: 'db-redis-streams',label: 'Streams' },
      ]},
    ],
  },
];

// Flat list for ⌘K search.
window.ATLAS_PAGES = (() => {
  const out = [];
  const walk = (nodes, trail) => {
    for (const n of nodes) {
      const path = [...trail, n.label];
      if (n.children) walk(n.children, path);
      else out.push({ id: n.id, label: n.label, path, tag: n.tag });
    }
  };
  walk(window.ATLAS_TREE, []);
  return out;
})();
