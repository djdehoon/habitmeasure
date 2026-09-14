import {
  DEFAULT_TIMER_GROUP_NAME,
  normalizeGroupName,
  type TimerTemplate,
} from "@/lib/utils/timerHelpers";

export type TimerTemplateWithGroup = TimerTemplate & {
  group_name: string;
  sort_order: number;
};

export type TimerGroupSection = {
  groupName: string;
  templates: TimerTemplateWithGroup[];
};

export function ensureTemplateGroupFields(template: TimerTemplate): TimerTemplateWithGroup {
  return {
    ...template,
    group_name: normalizeGroupName(template.group_name),
    sort_order: Number.isFinite(Number(template.sort_order)) ? Number(template.sort_order) : 0,
  };
}

export function groupTemplatesByName(templates: TimerTemplate[]): TimerGroupSection[] {
  const map = new Map<string, TimerTemplateWithGroup[]>();

  for (const raw of templates) {
    const template = ensureTemplateGroupFields(raw);
    const key = template.group_name;
    const list = map.get(key);
    if (list) list.push(template);
    else map.set(key, [template]);
  }

  const sections: TimerGroupSection[] = [];
  for (const [groupName, items] of map.entries()) {
    items.sort((a, b) => a.sort_order - b.sort_order || a.template_name.localeCompare(b.template_name));
    sections.push({ groupName, templates: items });
  }

  sections.sort((a, b) => {
    if (a.groupName === DEFAULT_TIMER_GROUP_NAME) return -1;
    if (b.groupName === DEFAULT_TIMER_GROUP_NAME) return 1;
    return a.groupName.localeCompare(b.groupName);
  });

  return sections;
}

export type ReorderItem = {
  id: string;
  group_name: string;
  sort_order: number;
};

/** Flatten sections into persisted order fields. */
export function flattenSectionsToReorderItems(sections: TimerGroupSection[]): ReorderItem[] {
  const items: ReorderItem[] = [];
  for (const section of sections) {
    const groupName = normalizeGroupName(section.groupName);
    section.templates.forEach((template, index) => {
      items.push({
        id: template.id,
        group_name: groupName,
        sort_order: index,
      });
    });
  }
  return items;
}

export function moveTemplateInSections(
  sections: TimerGroupSection[],
  templateId: string,
  targetGroupName: string,
  targetIndex: number,
): TimerGroupSection[] {
  const next = sections.map((section) => ({
    groupName: section.groupName,
    templates: [...section.templates],
  }));

  let moved: TimerTemplateWithGroup | null = null;
  for (const section of next) {
    const idx = section.templates.findIndex((t) => t.id === templateId);
    if (idx >= 0) {
      moved = section.templates.splice(idx, 1)[0] ?? null;
      break;
    }
  }
  if (!moved) return sections;

  const targetName = normalizeGroupName(targetGroupName);
  let target = next.find((s) => s.groupName === targetName);
  if (!target) {
    target = { groupName: targetName, templates: [] };
    next.push(target);
  }

  const clamped = Math.max(0, Math.min(targetIndex, target.templates.length));
  target.templates.splice(clamped, 0, {
    ...moved,
    group_name: targetName,
  });

  return next.filter((s) => s.templates.length > 0 || s.groupName === targetName);
}

export function renameGroupInSections(
  sections: TimerGroupSection[],
  fromName: string,
  toName: string,
): TimerGroupSection[] {
  const nextName = normalizeGroupName(toName);
  const from = normalizeGroupName(fromName);
  if (from === nextName) return sections;

  const next = sections.map((section) => {
    if (section.groupName !== from) return section;
    return {
      groupName: nextName,
      templates: section.templates.map((t) => ({ ...t, group_name: nextName })),
    };
  });

  // Merge if target name already exists
  const merged = new Map<string, TimerTemplateWithGroup[]>();
  for (const section of next) {
    const existing = merged.get(section.groupName) ?? [];
    merged.set(section.groupName, [...existing, ...section.templates]);
  }

  return Array.from(merged.entries()).map(([groupName, templates]) => ({ groupName, templates }));
}

export function addEmptyGroup(sections: TimerGroupSection[], name: string): TimerGroupSection[] {
  const groupName = normalizeGroupName(name);
  if (sections.some((s) => s.groupName === groupName)) return sections;
  return [...sections, { groupName, templates: [] }];
}
