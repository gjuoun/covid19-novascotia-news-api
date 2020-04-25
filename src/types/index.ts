export interface News {
  id: string;
  title: string;
  timestamp: number;
  summary: string;
}

interface Webhook{
  timestamp: number
  url:string
}

export interface Database {
  covidNews: Array<News>;
  webhooks: Array<Webhook>
}