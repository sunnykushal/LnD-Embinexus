import { useState } from "react";

export default function CourseView({ course }) {
  const [quizScores, setQuizScores] = useState({});

  const handleSelectOption = (questionIndex, selectedOption) => {
    const isCorrect = selectedOption.startsWith(
      course.quiz[questionIndex].correct_answer,
    );
    setQuizScores({
      ...quizScores,
      [questionIndex]: isCorrect ? "correct" : "incorrect",
    });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-10 animate-fade-in">
      {/* HEADER SECTION */}
      <header className="border-b border-slate-100 pb-6 flex justify-between items-start">
        <div>
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Review-Ready Module
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-3">
            {course.title}
          </h1>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-lg border border-slate-200 transition"
        >
          🖨️ Export (PDF)
        </button>
      </header>

      {/* LEARNING OBJECTIVES */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
        <h2 className="text-lg font-bold text-blue-900 mb-3 flex items-center space-x-2">
          <span>🎯</span>
          <span>Learning Objectives</span>
        </h2>
        <ul className="list-disc list-inside space-y-2 text-blue-800 font-medium text-sm">
          {course.learning_objectives?.map((obj, i) => (
            <li key={i}>{obj}</li>
          ))}
        </ul>
      </section>

      {/* CORE CURRICULUM CONCEPTS */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center space-x-2">
          <span>📖</span>
          <span>Core Concepts</span>
        </h2>
        <div className="grid grid-cols-1 gap-6">
          {course.core_concepts?.map((concept, i) => (
            <div
              key={i}
              className="border border-slate-100 p-6 rounded-xl space-y-3 bg-slate-50/50 hover:bg-slate-50 transition"
            >
              <h3 className="text-lg font-bold text-slate-800">
                {concept.concept_name}
              </h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                {concept.explanation}
              </p>
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg text-sm text-amber-950">
                <strong>💡 Real-World Analogy:</strong>{" "}
                {concept.real_world_example}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* INTERACTIVE QUIZ SECTION */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center space-x-2">
          <span>🧩</span>
          <span>Interactive Knowledge Check</span>
        </h2>
        <div className="space-y-6">
          {course.quiz?.map((q, qIdx) => (
            <div
              key={qIdx}
              className="bg-slate-50 border border-slate-200 p-6 rounded-xl space-y-4"
            >
              <div className="flex justify-between items-center">
                <p className="font-bold text-slate-800">
                  {qIdx + 1}. {q.question}
                </p>
                {quizScores[qIdx] && (
                  <span
                    className={`text-xs font-bold uppercase px-2 py-1 rounded ${quizScores[qIdx] === "correct" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}
                  >
                    {quizScores[qIdx] === "correct"
                      ? "🎉 Correct!"
                      : "❌ Try Again"}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {q.options?.map((opt, optIndex) => (
                  <button
                    key={optIndex}
                    onClick={() => handleSelectOption(qIdx, opt)}
                    className="p-3 bg-white border border-slate-200 rounded-lg text-left hover:bg-blue-50 hover:border-blue-300 transition text-sm text-slate-700 font-medium shadow-sm"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
