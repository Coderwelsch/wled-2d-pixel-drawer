import HomeView from "@/views/HomeView.vue"
import { describe, it, expect } from "vitest"

import { mount } from "@vue/test-utils"

describe("HomeView", () => {
	it("renders properly", () => {
		const wrapper = mount(HomeView)
		expect(wrapper.text()).toContain("PIXEL DI/SPLAY")
	})
})
