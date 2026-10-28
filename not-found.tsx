import { Link } from 'wouter';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return <main className="not-found-page"><div className="not-found-card"><AlertCircle size={30}/><p className="eyebrow">404 · PAGE NOT FOUND</p><h1>페이지를 찾을 수 없습니다.</h1><p>주소가 잘못되었거나 페이지가 이동되었을 수 있습니다.</p><Link className="btn btn-primary" href="/"><ArrowLeft size={16}/> 메인으로 돌아가기</Link></div></main>;
}
