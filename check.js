/* PenLog drydock check: questions, copy and scoring (spec 2026-11-15, sections 2–6).
 * Edit wording here; check.html only renders it. Tests: node --test tests/
 *
 * Copy rules: blame the tool, never the person. Never "free" (say "no licence fee").
 * Regulations: SOLAS II-2, FTP Code, ISM only; PenLog produces the evidence, never "required".
 * Never UR Z28. Never draft stops. The Verify card must not say "audit trail".
 */
(function (root) {
  'use strict';

  var QUESTIONS = [
    {
      id: 'q1', weight: 2,
      text: 'On your last drydock, when a contractor opened a penetration in an A-class division, how soon did your team know?',
      options: [
        { label: 'Same shift', score: 0 },
        { label: 'Next day', score: 1 },
        { label: 'When found on rounds', score: 2 },
        { label: 'At close-out, or not at all', score: 2 }
      ],
      gap: {
        why: 'An open A-class penetration that nobody knows about is a fire boundary that isn’t there. On a busy dock, with hot work nearby, hours matter.',
        how: 'Contractors log each opening on their phone with a photo; it appears on your dashboard at once.',
        link: '/#how-it-works'
      }
    },
    {
      id: 'q2', weight: 2,
      text: 'Each morning, could you list every open fire-boundary penetration, how long it had been open and who opened it?',
      options: [
        { label: 'Yes, routinely', score: 0 },
        { label: 'With effort', score: 1 },
        { label: 'No', score: 2 }
      ],
      gap: {
        why: 'The duty officer and the yard safety office need today’s open boundaries, not last week’s spreadsheet. Without a daily list, fire risk is managed from memory.',
        how: 'The daily Fire Status sheet lists every open penetration, A-60s highlighted, with how long it has been open and which contractor opened it.',
        link: '/#fire-status'
      }
    },
    {
      id: 'q3', weight: 1,
      text: 'For each closed penetration, do you have a timestamped photo of the seal, tied to that exact penetration?',
      options: [
        { label: 'Yes, every one', score: 0 },
        { label: 'Some, or loose in chats and email', score: 1 },
        { label: 'No', score: 2 }
      ],
      gap: {
        why: 'Once a seal is painted over or boxed in, the photo is the only evidence of what was done. Photos scattered across phones and chat groups are hard to match to a penetration afterwards.',
        how: 'Opening and closing photos are held on each penetration’s record, timestamped.',
        link: '/#features'
      }
    },
    {
      id: 'q4', weight: 2,
      text: 'Did anyone check seals independently before they were signed off?',
      options: [
        { label: 'Every seal', score: 0 },
        { label: 'Spot checks', score: 1 },
        { label: 'No, contractors sign off their own', score: 2 }
      ],
      gap: {
        why: 'A self-certified seal is only as good as the last shift’s pressure to finish. An independent check is what turns a contractor’s word into evidence.',
        how: 'Verify rounds: a supervisor confirms or queries each seal on site. A query is a message sent inside PenLog to the contractor, who replies from their own link; query and reply stay on that penetration’s record, and the close-out report shows each query and when it was answered. No phone calls or WhatsApp threads to chase.',
        link: '/#how-it-works'
      }
    },
    {
      id: 'q5', weight: 1,
      text: 'Can you name the person, not just the company, who sealed each penetration?',
      options: [
        { label: 'Yes', score: 0 },
        { label: 'For some', score: 1 },
        { label: 'No', score: 2 }
      ],
      gap: {
        why: 'When a seal fails inspection, “the insulation contractor” is not an answer. Knowing the person makes rework fast and accountability real.',
        how: 'Each contractor works from their own personal link, so every record names the person.',
        link: '/#features'
      }
    },
    {
      id: 'q6', weight: 1,
      text: 'If a row in your tracker was edited or deleted, could you see who did it and when?',
      options: [
        { label: 'Yes', score: 0 },
        { label: 'Not reliably', score: 1 },
        { label: 'No', score: 2 }
      ],
      gap: {
        why: 'A shared spreadsheet can be changed by anyone, without a trace. That makes it hard to rely on as a record when it matters most.',
        how: 'Every change is written to the audit trail: who, what, when.',
        link: '/#features'
      }
    },
    {
      id: 'q7', weight: 2,
      text: 'At delivery, could an open penetration have slipped through unnoticed?',
      options: [
        { label: 'No, impossible', score: 0 },
        { label: 'Possibly', score: 1 },
        { label: 'Yes, it has happened', score: 2 }
      ],
      gap: {
        why: 'An open penetration that sails with the ship is a gap in a fire division at sea. Spreadsheets make it easy for one row to be filtered or scrolled out of sight.',
        how: 'The close-out report lists every outstanding item, and they cannot be hidden.',
        link: '/#features'
      }
    },
    {
      id: 'q8', weight: 1,
      text: 'How long did it take to assemble the close-out evidence for class, flag or your HSQE file?',
      options: [
        { label: 'Hours', score: 0 },
        { label: 'Days', score: 1 },
        { label: 'Weeks, or we didn’t', score: 2 }
      ],
      gap: {
        why: 'Evidence assembled after the dock, from photos, emails and spreadsheets, costs days and still leaves gaps. Under ISM, the record is part of the job.',
        how: 'The close-out report and Excel evidence package are produced from the records in one step.',
        link: '/#features'
      }
    }
  ];

  var QUALIFIERS = [
    { id: 'dock', text: 'When is your next drydock?', options: ['Within 3 months', '3–6 months', '6–12 months', 'Over a year / not planned'] },
    { id: 'fleet', text: 'How many ships are you responsible for?', options: ['1', '2–5', '6–20', 'More than 20'] }
  ];

  var EXPOSURE_TEXT = {
    High: 'This is common: most docks still run on spreadsheets and paper, and those weren’t built to track live fire boundaries. Your answers point to a few places where an open penetration or an unproven seal could slip past a good team.',
    Medium: 'Your process covers most of the ground. A few areas still depend on memory and manual records, which is where evidence tends to go missing on a busy dock.',
    Low: "You're running a well-controlled dock. PenLog would mainly save your team the admin of proving it."
  };

  var NO_GAPS_TEXT = 'You reported no gaps: a well-controlled dock. If proving it still takes your team days of spreadsheets and photo hunting, a demo will show how PenLog cuts that work.';

  var MAX = QUESTIONS.reduce(function (s, q) { return s + 2 * q.weight; }, 0);

  function scoreAnswers(answers) {
    var total = 0, fullGapOnDouble = false, gaps = [];
    QUESTIONS.forEach(function (q, order) {
      var opt = q.options[answers[q.id]];
      if (!opt) return;
      total += opt.score * q.weight;
      if (q.weight === 2 && opt.score === 2) fullGapOnDouble = true;
      if (opt.score > 0) {
        gaps.push({ id: q.id, order: order, answerLabel: opt.label, score: opt.score, weight: q.weight,
          why: q.gap.why, how: q.gap.how, link: q.gap.link });
      }
    });
    gaps.sort(function (a, b) { return (b.weight - a.weight) || (a.order - b.order); });
    gaps.forEach(function (g) { delete g.order; });
    var exposure = total >= 14 ? 'High' : total >= 6 ? 'Medium' : 'Low';
    if (fullGapOnDouble && exposure === 'Low') exposure = 'Medium';
    return { total: total, max: MAX, exposure: exposure, gaps: gaps };
  }

  function primaryCta(dockIndex) {
    return dockIndex === 0 ? 'pilot' : 'demo';
  }

  function plain(s) {
    return String(s).replace(/[–—]/g, '-');
  }

  function assessmentSummary(result, answers, quals) {
    var dock = QUALIFIERS[0].options[quals.dock];
    var fleet = QUALIFIERS[1].options[quals.fleet];
    var parts = [
      'Exposure: ' + result.exposure + ' (' + result.total + '/' + result.max + ')',
      'Next dock: ' + (dock ? plain(dock.charAt(0).toLowerCase() + dock.slice(1)) : '—'),
      'Ships: ' + (fleet ? plain(fleet) : '—')
    ];
    QUESTIONS.forEach(function (q) {
      var opt = q.options[answers[q.id]];
      if (opt && opt.score > 0) parts.push(q.id.toUpperCase() + ' ' + opt.label);
    });
    return parts.join(' · ').slice(0, 1000);
  }

  var api = { QUESTIONS: QUESTIONS, QUALIFIERS: QUALIFIERS, EXPOSURE_TEXT: EXPOSURE_TEXT, NO_GAPS_TEXT: NO_GAPS_TEXT,
    scoreAnswers: scoreAnswers, primaryCta: primaryCta, assessmentSummary: assessmentSummary };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PenLogCheck = api;
})(this);
