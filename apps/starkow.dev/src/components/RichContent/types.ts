export type Content =
  | string
  | { type: 'bold', children: Content[] }
  | { type: 'italic', children: Content[] }
  | { type: 'code', children: Content[] }
  | { type: 'strike', children: Content[] }
  | { type: 'underline', children: Content[] }
  | { type: 'highlight', children: Content[] }
  | { type: 'muted', children: Content[] }
  | { type: 'link', href: string, children: Content[] }
  | { type: 'br' }
