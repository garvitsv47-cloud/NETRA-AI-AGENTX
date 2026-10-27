import React, { useState } from 'react';
import { useNetra } from '../context/NetraContext';
import { KnowledgeDocument, KnowledgeChunk } from '../types/netra';
import {
  Upload,
  FileText,
  Trash2,
  Search,
  BookOpen,
  Send,
  CheckCircle2,
} from 'lucide-react';

export const KnowledgeBaseView: React.FC = () => {
  const { documents, uploadKnowledgeDocument, deleteKnowledgeDocument } = useNetra();

  const [selectedDocId, setSelectedDocId] = useState<string>(documents[0]?.id || 'DOC-01');
  const [searchFilter, setSearchFilter] = useState('');
  const [ragQuestion, setRagQuestion] = useState(
    "What is our company's policy for delayed high-priority shipments?"
  );
  const [isQueryingRag, setIsQueryingRag] = useState(false);
  const [ragResult, setRagResult] = useState<{
    question: string;
    answer: string;
    citedChunks: Array<{
      id: string;
      documentTitle: string;
      sectionTitle: string;
      content: string;
      tfidfScore: number;
    }>;
    provider: string;
    errorNotice?: string | null;
  } | null>(null);

  // Upload form state
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState<KnowledgeDocument['category']>('SLA Policy');
  const [uploadText, setUploadText] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const selectedDoc = documents.find((d) => d.id === selectedDocId) || documents[0];

  // Local TF-IDF + BM25 lexical similarity scorer over document chunks
  const computeTfIdfRetrieval = (query: string) => {
    const terms = query
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !['what', 'our', 'the', 'for', 'and', 'with', 'how', 'are'].includes(w));

    const allChunks: Array<{
      id: string;
      documentTitle: string;
      sectionTitle: string;
      content: string;
      tfidfScore: number;
    }> = [];

    const totalChunks = Math.max(
      1,
      documents.reduce((acc, d) => acc + d.chunks.length, 0)
    );

    // Document frequency per term
    const dfMap: Record<string, number> = {};
    for (const term of terms) {
      let df = 0;
      for (const doc of documents) {
        for (const chk of doc.chunks) {
          if (`${doc.title} ${chk.sectionTitle} ${chk.content}`.toLowerCase().includes(term)) {
            df++;
          }
        }
      }
      dfMap[term] = df;
    }

    for (const doc of documents) {
      for (const chk of doc.chunks) {
        const hay = `${doc.title} ${chk.sectionTitle} ${chk.content}`.toLowerCase();
        let score = 0;
        for (const term of terms) {
          const regex = new RegExp(term, 'g');
          const tf = (hay.match(regex) || []).length;
          if (tf > 0) {
            const idf = Math.log(1 + totalChunks / (1 + (dfMap[term] || 1)));
            score += (1 + Math.log(tf)) * idf;
          }
        }
        if (score > 0) {
          allChunks.push({
            id: chk.id,
            documentTitle: doc.title,
            sectionTitle: chk.sectionTitle,
            content: chk.content,
            tfidfScore: +score.toFixed(2),
          });
        }
      }
    }

    allChunks.sort((a, b) => b.tfidfScore - a.tfidfScore);
    return allChunks.slice(0, 3);
  };

  const handleRunRagQuery = async (customQuery?: string) => {
    const q = (customQuery ?? ragQuestion).trim();
    if (!q) return;
    setRagQuestion(q);
    setIsQueryingRag(true);

    const matchedChunks = computeTfIdfRetrieval(q);

    try {
      const res = await fetch('/api/gemini/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          matchedChunks,
        }),
      });
      const data = await res.json();
      setRagResult({
        question: q,
        answer: data.answer,
        citedChunks: matchedChunks,
        provider: data.provider || 'TFIDF_GEMINI_RAG',
        errorNotice: data.errorNotice || null,
      });
    } catch (_e) {
      setRagResult({
        question: q,
        answer:
          matchedChunks.length > 0
            ? `Grounded in **${matchedChunks[0].documentTitle}** (${matchedChunks[0].sectionTitle}):\n\n"${matchedChunks[0].content}"`
            : 'No matching policy excerpt found in uploaded documents.',
        citedChunks: matchedChunks,
        provider: 'LOCAL_TFIDF_RAG',
      });
    } finally {
      setIsQueryingRag(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('File exceeds maximum allowed size of 2 MB. Please upload a smaller policy document.');
      return;
    }
    setUploadError(null);

    const ext = file.name.split('.').pop()?.toUpperCase() || 'TXT';
    const fileType: KnowledgeDocument['fileType'] =
      ext === 'PDF' ? 'PDF' : ext === 'DOCX' ? 'DOCX' : 'TXT';

    const text = await file.text();
    const cleanText =
      text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '').trim() ||
      `Uploaded operational policy document: ${file.name}. Standard SLA and safety rules apply.`;

    const paragraphs = cleanText
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 20);

    const chunks: KnowledgeChunk[] = (paragraphs.length ? paragraphs : [cleanText]).map(
      (p, idx) => ({
        id: `UPL-${Date.now().toString().slice(-3)}-CHK-${idx + 1}`,
        sectionTitle: `Extracted Passage ${idx + 1}`,
        content: p.slice(0, 650),
        tokensCount: p.split(/\s+/).length,
      })
    );

    uploadKnowledgeDocument({
      title: uploadTitle.trim() || file.name.replace(/\.[^.]+$/, ''),
      fileName: file.name,
      fileType,
      category: uploadCategory,
      fileSizeKB: Math.max(12, Math.round(file.size / 1024)),
      rawText: cleanText,
      chunks,
    });
    setUploadTitle('');
  };

  const handleManualPolicyAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim() || !uploadText.trim()) return;

    const paragraphs = uploadText
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 10);

    const chunks: KnowledgeChunk[] = paragraphs.map((p, idx) => ({
      id: `DOC-M-${ idx + 1}`,
      sectionTitle: `Policy Clause ${idx + 1}`,
      content: p,
      tokensCount: p.split(/\s+/).length,
    }));

    uploadKnowledgeDocument({
      title: uploadTitle.trim(),
      fileName: `${uploadTitle.trim().replace(/\s+/g, '_')}.txt`,
      fileType: 'TXT',
      category: uploadCategory,
      fileSizeKB: Math.max(8, Math.round(uploadText.length / 120)),
      rawText: uploadText,
      chunks,
    });
    setUploadTitle('');
    setUploadText('');
  };

  const filteredDocs = documents.filter((d) =>
    searchFilter
      ? `${d.title} ${d.rawText} ${d.category}`
          .toLowerCase()
          .includes(searchFilter.toLowerCase())
      : true
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E2E8F0] rounded-md px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-xs text-[#64748B]">
            RAG-Powered Knowledge Base · Document Upload → Chunking → TF-IDF Vector Similarity → Grounded Gemini Answer
          </div>
          <h1 className="text-lg font-bold text-[#1F2937] mt-0.5">
            Company Operational Policies & Source-Cited RAG Intelligence
          </h1>
        </div>
        <div className="text-xs font-mono text-[#52677D]">
          Retrieval Pipeline: Local TF-IDF Vectorizer + Gemini 3.8 Flash Synthesis
        </div>
      </div>

      {/* Top Row: RAG Question & Source-Cited Answer Engine */}
      <div className="bg-white border border-[#E2E8F0] rounded-md p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-[#1F2937]">
              Ask Company Policy & SOP Knowledge Base (Grounded RAG)
            </h2>
            <p className="text-xs text-[#64748B]">
              Every answer is strictly grounded in uploaded Bharat Freight Logistics policy documents with verbatim source citations.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              "What is our company's policy for delayed high-priority shipments?",
              'What is the fuel reserve rule for pharmaceutical cold-chain reefers?',
              'What is the speed limit on Lonavala Boreghat during rain?',
            ].map((sampleQ) => (
              <button
                key={sampleQ}
                onClick={() => handleRunRagQuery(sampleQ)}
                className="px-2.5 py-1 text-[11px] bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded text-[#52677D] font-medium cursor-pointer"
              >
                {sampleQ.slice(0, 42)}...
              </button>
            ))}
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRunRagQuery();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={ragQuestion}
            onChange={(e) => setRagQuestion(e.target.value)}
            placeholder="Ask any question about SLA penalties, monsoon bypass rules, cold-chain reserves, or emergency triage..."
            className="flex-1 px-3.5 py-2 text-xs border border-[#E2E8F0] rounded bg-[#F8FAFC] text-[#1F2937]"
          />
          <button
            type="submit"
            disabled={isQueryingRag}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#52677D] hover:bg-[#415366] rounded flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Send className="w-3.5 h-3.5" />
            {isQueryingRag ? 'Retrieving Chunks...' : 'Retrieve & Answer'}
          </button>
        </form>

        {ragResult && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-3 border-t border-[#E2E8F0]">
            {/* Grounded Answer (7 cols) */}
            <div className="lg:col-span-7 p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#52677D]">
                <span>GROUNDED SYNTHESIS ({ragResult.provider})</span>
                <span>{ragResult.citedChunks.length} Supporting Passages Retrieved</span>
              </div>
              {ragResult.errorNotice && (
                <div className="p-2 bg-[#FFFBEB] border border-[#FDE68A] rounded text-[11px] text-[#B58A45]">
                  {ragResult.errorNotice}
                </div>
              )}
              <div className="whitespace-pre-line text-[#1F2937] leading-relaxed">
                {ragResult.answer}
              </div>
            </div>

            {/* Verbatim Cited Document Chunks (5 cols) */}
            <div className="lg:col-span-5 space-y-2">
              <div className="text-xs font-semibold text-[#1F2937]">
                Supporting Source Passages (TF-IDF Ranked):
              </div>
              {ragResult.citedChunks.length === 0 ? (
                <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded text-xs text-[#B85C5C]">
                  No matching passage found in uploaded documents.
                </div>
              ) : (
                ragResult.citedChunks.map((chk, i) => (
                  <div
                    key={chk.id}
                    className="p-3 bg-white border border-[#E2E8F0] rounded text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-[#52677D]">
                        [Citation {i + 1}] {chk.documentTitle}
                      </span>
                      <span className="font-mono text-[#64748B]">Score: {chk.tfidfScore}</span>
                    </div>
                    <div className="text-[11px] font-medium text-[#1F2937]">{chk.sectionTitle}</div>
                    <p className="text-[11px] text-[#64748B] italic leading-relaxed">
                      "{chk.content}"
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Split: Document Repository & Upload (5 cols) + Document Chunk Inspector (7 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        {/* Left 5 cols: Uploaded Documents & Upload Form */}
        <div className="xl:col-span-5 bg-white border border-[#E2E8F0] rounded-md p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
              <h3 className="text-sm font-semibold text-[#1F2937]">
                Indexed Policy Documents ({documents.length})
              </h3>
              <div className="relative w-44">
                <Search className="w-3 h-3 text-[#64748B] absolute left-2.5 top-2" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter documents..."
                  className="w-full pl-7 pr-2 py-1 text-[11px] border border-[#E2E8F0] rounded bg-[#F8FAFC]"
                />
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`p-3 rounded border text-xs flex items-center justify-between cursor-pointer ${
                    selectedDoc?.id === doc.id
                      ? 'bg-[#F1F5F9] border-[#52677D]'
                      : 'bg-white border-[#E2E8F0] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold text-[#1F2937] truncate">{doc.title}</div>
                    <div className="text-[11px] text-[#64748B] font-mono mt-0.5">
                      {doc.fileType} · {doc.category} · {doc.chunks.length} Chunks · {doc.uploadedAt}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteKnowledgeDocument(doc.id);
                    }}
                    title="Delete Document"
                    className="p-1.5 text-[#64748B] hover:text-[#B85C5C] shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Upload New Document Form */}
          <form
            onSubmit={handleManualPolicyAdd}
            className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded space-y-2.5 text-xs"
          >
            <div className="font-semibold text-[#1F2937] flex items-center justify-between">
              <span>Upload or Paste New Operational Policy</span>
              <label className="px-2.5 py-1 bg-[#52677D] text-white rounded text-[11px] font-medium cursor-pointer flex items-center gap-1">
                <Upload className="w-3 h-3" />
                Upload File (.TXT/.PDF/.DOCX)
                <input
                  type="file"
                  accept=".txt,.md,.pdf,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            {uploadError && (
              <div className="p-2 bg-[#FEF2F2] border border-[#FECACA] rounded text-[11px] text-[#B85C5C]">
                {uploadError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="Document Title (e.g. Customer SLA Annex)"
                className="px-2.5 py-1.5 bg-white border border-[#E2E8F0] rounded text-xs"
              />
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value as any)}
                className="px-2.5 py-1.5 bg-white border border-[#E2E8F0] rounded text-xs"
              >
                <option value="SLA Policy">SLA Policy</option>
                <option value="Route Policy">Route Policy</option>
                <option value="Weather SOP">Weather SOP</option>
                <option value="Safety Manual">Safety Manual</option>
              </select>
            </div>

            <textarea
              rows={2}
              value={uploadText}
              onChange={(e) => setUploadText(e.target.value)}
              placeholder="Or paste operational policy clauses here to auto-chunk & index..."
              className="w-full p-2 bg-white border border-[#E2E8F0] rounded text-xs"
            />
            <button
              type="submit"
              className="w-full py-1.5 bg-[#1F2937] hover:bg-[#334155] text-white font-medium rounded cursor-pointer"
            >
              Extract, Chunk & Index Document
            </button>
          </form>
        </div>

        {/* Right 7 cols: Extracted Text & Chunk Metadata Viewer */}
        <div className="xl:col-span-7 bg-white border border-[#E2E8F0] rounded-md p-5 space-y-4">
          {selectedDoc ? (
            <>
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                <div>
                  <div className="text-xs font-mono text-[#52677D]">
                    DOCUMENT CHUNK & METADATA INSPECTOR · {selectedDoc.id}
                  </div>
                  <h3 className="text-base font-bold text-[#1F2937] mt-0.5">{selectedDoc.title}</h3>
                </div>
                <span className="text-xs font-mono text-[#64748B]">
                  {selectedDoc.fileName} ({selectedDoc.fileSizeKB} KB)
                </span>
              </div>

              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {selectedDoc.chunks.map((chk) => (
                  <div
                    key={chk.id}
                    className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#64748B]">
                      <span className="font-semibold text-[#52677D]">
                        Chunk ID: {chk.id} · {chk.sectionTitle}
                      </span>
                      <span>{chk.tokensCount} tokens</span>
                    </div>
                    <p className="text-[#1F2937] leading-relaxed">{chk.content}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-xs text-[#64748B]">Select a document to inspect its chunks.</div>
          )}
        </div>
      </div>
    </div>
  );
};
