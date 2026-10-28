export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export interface VirtualHttpRequest {
  method: HttpMethod;
  path: string;
  query?: Record<string, string>;
  headers?: Record<string, string>;
  body?: string;
  cookies?: Record<string, string>;
}

export interface VirtualHttpResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  html: string;
  setCookies?: Record<string, string>;
}

export interface PageContext {
  cookies?: Record<string, string>;
  hash?: string;
}

export interface RouteContext {
  req: VirtualHttpRequest;
  path: string;
  query: Record<string, string>;
  headers: Record<string, string>;
  cookies: Record<string, string>;
  createHtml: (title: string, bodyContent: string) => string;
}

export type RouteHandler = (ctx: RouteContext) => Promise<VirtualHttpResponse> | VirtualHttpResponse;
