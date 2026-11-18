import Link from 'next/link';
import TermsDocument from '@/components/TermsDocument';
import '../platform.css';

export default function TermsPage(){
  return <main className="lm-page">
    <div className="lm-frame">
      <div className="lm-main lm-terms">
        <p><Link href="/">LikeMinds</Link></p>
        <TermsDocument />
      </div>
    </div>
  </main>;
}
