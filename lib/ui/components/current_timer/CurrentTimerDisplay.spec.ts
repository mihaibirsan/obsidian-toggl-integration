import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/svelte";
import type {
  EnrichedWithProject,
  EnrichedWithTags,
  TimeEntry,
  ProjectsResponseItem,
  EnrichedWithClient,
} from "lib/model/Report-v3";
import { settingsStore, togglService } from "lib/util/stores";
import { vi } from "vitest";

vi.mock("obsidian", () => ({
  setIcon: () => {},
}));
vi.mock("lib/util/renderMarkdown", () => ({
  renderMarkdown: (text: string) => text,
}));

// TODO: Is there a better way to mock the Toggl service?
const startTimerMock = vi.fn();
const stopTimerMock = vi.fn();
togglService.set({
  startTimer: startTimerMock,
  stopTimer: stopTimerMock,
} as any);

import CurrentTimerDisplay from "./CurrentTimerDisplay.svelte";

type CurrentTimerMock = EnrichedWithProject<
  EnrichedWithTags<TimeEntry>,
  EnrichedWithClient<ProjectsResponseItem>
>;

describe("CurrentTimerDisplay", () => {
  const project: EnrichedWithClient<ProjectsResponseItem> = {
    $client: null,
    active: true,
    actual_hours: 0,
    at: "2021-01-01T00:00:00+00:00",
    cid: null,
    client_id: null,
    color: "#FF0000",
    created_at: "2021-01-01T00:00:00+00:00",
    id: 1,
    is_private: false,
    name: "Project 1",
    rate: null,
    rate_last_updated: null,
    recurring: false,
    server_deleted_at: null,
    wid: 1,
    workspace_id: 1,
  };
  const tags = ["tag1", "tag2"];
  const timer: CurrentTimerMock = {
    $project: project,
    at: "2021-01-01T00:00:00+00:00",
    description: "Timer description",
    duration: 60,
    id: 1,
    project_id: 1,
    server_deleted_at: null,
    start: "2021-01-01T00:00:00+00:00",
    stop: null,
    tag_ids: [1, 2],
    tags: tags,
    user_id: 1,
    workspace_id: 1,
  };
  const duration = 60;

  beforeEach(() => {
    settingsStore.update((settings) => ({ ...settings, parseMarkdown: true }));
    startTimerMock.mockReset();
    stopTimerMock.mockReset();
  });

  afterEach(() => {
    settingsStore.update((settings) => ({ ...settings, parseMarkdown: false }));
  });

  it("displays the timer description", () => {
    render(CurrentTimerDisplay, { duration, timer });
    expect(screen.getByText("Timer description")).toBeInTheDocument();
  });

  it("displays a message when no timer is active", () => {
    render(CurrentTimerDisplay, { duration, timer: null });
    expect(screen.getByText("No active time entry")).toBeInTheDocument();
  });

  it("displays the project name and color", () => {
    render(CurrentTimerDisplay, { duration, timer });
    const projectCircle = screen.getByTestId("project-circle");
    expect(projectCircle).toHaveStyle({ "background-color": "#FF0000" });
    expect(screen.getByText("Project 1")).toBeInTheDocument();
  });

  it("displays the tags", () => {
    render(CurrentTimerDisplay, { duration, timer });
    expect(screen.getByText("tag1")).toBeInTheDocument();
    expect(screen.getByText("tag2")).toBeInTheDocument();
  });

  it("displays a message when there are no tags", () => {
    render(CurrentTimerDisplay, { duration, timer: { ...timer, tags: [] } });
    // TODO: Is there a better way to test for the absence of an element?
    // https://testing-library.com/docs/guide-disappearance/#disappearance
    expect(() => screen.getByTestId("timer-tag")).toThrow();
  });

  it("displays the duration", () => {
    render(CurrentTimerDisplay, { duration, timer });
    expect(screen.getByText("0:01:00")).toBeInTheDocument();
  });

  it("starts a new timer when clicked", async () => {
    render(CurrentTimerDisplay, { duration, timer: null });
    const startButton = screen.getByTestId("timer-start-button");
    await fireEvent.click(startButton);
    expect(startTimerMock).toHaveBeenCalled();
  });

  it("stops the active timer when clicked", async () => {
    render(CurrentTimerDisplay, { duration, timer });
    const stopButton = screen.getByTestId("timer-stop-button");
    await fireEvent.click(stopButton);
    expect(stopTimerMock).toHaveBeenCalled();
  });
});
