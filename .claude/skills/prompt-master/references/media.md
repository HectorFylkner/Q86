# Media generation — image, video, 3D, voice

Carried forward from prompt-master 1.5.0 with light edits. Tool-version specifics in this file (parameter flags, model versions, sampler defaults) churn faster than LLM guidance — if output quality suggests a tool has changed its syntax, verify against the tool's current docs before insisting on these parameters.

## Contents
1. Image generation
2. Reference-image editing
3. ComfyUI
4. Video
5. 3D
6. Voice

---

## 1. Image generation

First detect: generation from scratch, or editing an existing image (→ §2)?

Universal descriptor stack (Template I in `references/templates.md` has the fill-in version): subject → action/pose → setting → style → mood → lighting → color palette → composition → aspect ratio → negative prompts → style reference.

- **Midjourney:** comma-separated descriptors, not prose. Subject first, then style/mood/lighting/composition; parameters at the end (`--ar 16:9 --style raw`, version flag as current). Negatives via `--no [elements]`.
- **DALL-E-class / GPT image:** prose descriptions work; describe foreground/midground/background separately for complex compositions; add "no text in the image" unless text is wanted.
- **Stable Diffusion:** `(word:weight)` syntax; CFG ~7–12; negative prompt mandatory; steps 20–30 drafts, 40–50 finals.
- **Gemini 3.x image (3 Pro Image / 3.1 Flash Image):** reasoning-based image generation with optional Google-Search grounding — for fact-dependent imagery (weather, charts), say what should be looked up; supports conversational multi-turn editing ("make the background a sunset").
- **Stylized generators (SeeDream-class):** name the art style explicitly (anime / cinematic / painterly) before scene content; mood and atmosphere descriptors carry weight; negative prompt recommended.

## 2. Reference-image editing

Detect on "change / edit / modify / adjust" + an existing image. Completely different from generation — describe the delta only, never the whole scene.

Always tell the user first: "Attach your reference image to [tool] before sending this prompt."

Structure: reference image → what stays exactly the same (exhaustive) → what changes (precise, single edit) → magnitude (subtle/moderate/significant) → style consistency line → negative prompt against introduced artifacts.

Tool routing: Midjourney `--cref` (character) / `--sref` (style); DALL-E-class via the edit endpoint, not generate; Stable Diffusion img2img with denoising ~0.3–0.6 to preserve the original; Gemini image models edit conversationally in-thread.

## 3. ComfyUI

Node-based — not a single prompt box. Ask which checkpoint is loaded before writing; syntax and token limits differ per model. SD 1.5: short blocks (<75 tokens), weighted syntax. SDXL: longer prompts, natural language + weights. Flux: natural language, minimal weighting, very responsive to style description. Always output **Positive** and **Negative** prompts as separate blocks, plus checkpoint, sampler (Euler a as a starting point), CFG (~7), steps (20–30), and a resolution divisible by 64. Template K has the fill-in version.

## 4. Video

Direct like a film shot: camera movement is the highest-leverage variable (static / dolly / crane / handheld), then shot type, duration, and cut style.
- **Sora-class:** full shot direction — camera move, lens feel, subject action, setting, light.
- **Runway:** responds to cinematic vocabulary — reference film styles for a consistent aesthetic.
- **Kling:** strong human motion — describe body movement explicitly; specify camera angle and shot type.
- **LTX-class (fast):** concise, visual, prompt-sensitive; specify resolution and motion intensity.
- **Dream Machine (Luma):** reference lighting setups, lens types, color grading.

## 5. 3D

- **Text-to-3D (Meshy, Tripo, Rodin):** style keyword (low-poly / realistic / stylized) + subject + key features + primary material + texture detail + technical spec. Use the negative prompt ("no background, no base, no floating parts"). Specify export target (GLB/FBX for engines, STL for printing); A-pose/T-pose for riggable characters. Meshy → game assets/teams; Tripo → fastest clean topology; Rodin → highest photorealism, slower.
- **In-engine (Unity AI, Blender add-ons):** Unity AI — `/ask` for docs/project queries, `/run` for Editor automation, `/code` for C#; state exactly what happens in the Editor; for generators (sprite/texture/animation) give asset type, art style, and technical constraints (resolution, palette, loop vs one-shot). Blender AI add-ons generate Python that executes in-scene — be specific about geometry, material names, and scope ("apply to selected object" vs "entire scene").

## 6. Voice

(ElevenLabs-class.) Prose mood descriptions don't translate — specify parameters directly: emotion, pacing, speech rate, and emphasis/pause markers on the exact words (SSML-style). Mark which words to stress and where pauses fall.
