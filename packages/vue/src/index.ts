import { defineComponent, h, type PropType } from "vue";
import { createAvatarDataUri } from "@hashmug/core";

/** `<HashMug seed="0xabc..." :size="64" radius="round" />`. Renders an `<img>`; same seed, same face. */
export const HashMug = defineComponent({
  name: "HashMug",
  props: {
    /** Any text: name, handle, email, ENS name, wallet address. */
    seed: { type: String, required: true },
    size: { type: Number, default: 64 },
    /** 0 (square) to 0.5 (circle), or "round". */
    radius: { type: [Number, String] as PropType<number | "round">, default: undefined },
    /** Accessible name. The seed is never used: an address read aloud is noise. */
    label: { type: String, default: "Avatar" },
    /** Hide from assistive tech, for when a name sits next to the avatar. */
    decorative: { type: Boolean, default: false },
  },
  setup(props) {
    return () => {
      const r = props.radius === "round" ? 0.5 : props.radius;
      return h("img", {
        src: createAvatarDataUri(props.seed, r === undefined ? {} : { radius: r as number }),
        width: props.size,
        height: props.size,
        alt: props.decorative ? "" : props.label,
        ...(props.decorative ? { "aria-hidden": "true" } : {}),
      });
    };
  },
});
