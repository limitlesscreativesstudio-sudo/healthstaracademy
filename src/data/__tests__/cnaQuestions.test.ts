import { describe, expect, it } from "vitest";
import { cnaQuestions, getPracticeCategories } from "../cnaQuestions";

describe("public CNA practice bank", () => {
  it("appends all 45 scenario questions after ID 215", () => {
    expect(cnaQuestions).toHaveLength(260);
    expect(cnaQuestions.slice(-45).map(question => question.id)).toEqual(
      Array.from({ length: 45 }, (_, index) => index + 216),
    );
    expect(new Set(cnaQuestions.map(question => question.id)).size).toBe(260);
  });

  it("preserves every supplied scenario answer", () => {
    expect(cnaQuestions.slice(-45).map(question => question.correctAnswer).join(""))
      .toBe("ADCB DABC ADCB DABC ADCB DABC ADCB DABC ADCB DABC ADCB D".replace(/ /g, ""));
  });

  it("calculates category counts from real data, including future additions", () => {
    expect(getPracticeCategories().reduce((sum, category) => sum + category.questionCount, 0)).toBe(260);
    for (const category of getPracticeCategories()) {
      expect(category.questionCount).toBe(cnaQuestions.filter(question => question.category === category.id).length);
    }
    const first = cnaQuestions[0];
    if (!first) throw new Error("Missing practice questions");
    const expanded = getPracticeCategories([...cnaQuestions, { ...first, id: 261 }]);
    expect(expanded.find(category => category.id === first.category)?.questionCount)
      .toBe(cnaQuestions.filter(question => question.category === first.category).length + 1);
  });
});