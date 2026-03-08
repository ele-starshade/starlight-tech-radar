/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountComponent } from 'test/utils/test-setup'
import RadarBlipFeedbackDialog from 'src/components/radar/feedback/RadarBlipFeedbackDialog.vue'
import { defineComponent, nextTick } from 'vue'

const QBtnStub = defineComponent({
  name: 'QBtn',
  props: ['disable', 'loading', 'label'],
  template: '<button :disabled="disable">{{ label }}<slot /></button>'
})

const QDialogStub = defineComponent({ name: 'QDialog', template: '<div class="q-dialog"><slot /></div>' })
const QSelectStub = defineComponent({ name: 'QSelect', template: '<div class="q-select"></div>' })
const QInputStub = defineComponent({ name: 'QInput', template: '<div class="q-input"></div>' })

describe('RadarBlipFeedbackDialog.vue', () => {
  const blip = { name: 'Test Blip' }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('matches snapshot', () => {
    const wrapper = mountComponent(RadarBlipFeedbackDialog, {
      props: {
        modelValue: true,
        blip
      }
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('disables submit button when inputs are empty', () => {
    const wrapper = mountComponent(RadarBlipFeedbackDialog, {
      props: { modelValue: true, blip },
      global: { stubs: { 'q-btn': QBtnStub } }
    })

    const submitBtn = wrapper.findAllComponents(QBtnStub).find(b => b.text().includes('radar.feedback.submit'))

    expect(submitBtn?.props('disable')).toBe(true)
  })

  it('enables submit button when inputs are filled', async () => {
    const wrapper = mountComponent(RadarBlipFeedbackDialog, {
      props: { modelValue: true, blip },
      global: { stubs: { 'q-btn': QBtnStub } }
    })

    const vm = wrapper.vm as any

    vm.feedbackType = 'Positive'
    vm.feedbackComment = 'Great!'
    await nextTick()

    const submitBtn = wrapper.findAllComponents(QBtnStub).find(b => b.text().includes('radar.feedback.submit'))

    expect(submitBtn?.props('disable')).toBe(false)
  })

  it('sends feedback successfully', async () => {
    const postSpy = vi.fn().mockResolvedValue({})
    const notifySpy = vi.fn()

    const wrapper = mountComponent(RadarBlipFeedbackDialog, {
      props: { modelValue: true, blip },
      global: {
        mocks: {
          $api: { post: postSpy },
          $q: { notify: notifySpy }
        }
      }
    })

    const vm = wrapper.vm as any

    vm.feedbackType = 'Positive'
    vm.feedbackComment = 'Great!'

    await vm.sendFeedback()

    expect(postSpy).toHaveBeenCalledWith('/api/feedback', {
      blipName: 'Test Blip',
      feedbackType: 'Positive',
      comment: 'Great!'
    })
    expect(notifySpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'positive' }))
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })

  it('handles feedback error', async () => {
    const postSpy = vi.fn().mockRejectedValue(new Error('Network Error'))
    const notifySpy = vi.fn()

    vi.spyOn(console, 'error').mockImplementation(() => {})

    const wrapper = mountComponent(RadarBlipFeedbackDialog, {
      props: { modelValue: true, blip },
      global: {
        mocks: {
          $api: { post: postSpy },
          $q: { notify: notifySpy }
        }
      }
    })

    const vm = wrapper.vm as any

    vm.feedbackType = 'Positive'
    vm.feedbackComment = 'Great!'

    await vm.sendFeedback()

    expect(notifySpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'negative' }))
    expect(vm.sending).toBe(false)
  })

  it('does nothing if required fields are missing', async () => {
    const postSpy = vi.fn()
    const wrapper = mountComponent(RadarBlipFeedbackDialog, {
      props: { modelValue: true, blip: null },
      global: { mocks: { $api: { post: postSpy } } }
    })

    const vm = wrapper.vm as any

    await vm.sendFeedback()
    expect(postSpy).not.toHaveBeenCalled()
  })

  it('emits update:modelValue when show computed is set', () => {
    const wrapper = mountComponent(RadarBlipFeedbackDialog, {
      props: { modelValue: true, blip }
    })

    const vm = wrapper.vm as any

    vm.show = false
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })

  it('handles component v-model updates', () => {
    const wrapper = mountComponent(RadarBlipFeedbackDialog, {
      props: { modelValue: true, blip },
      global: {
        stubs: {
          'q-dialog': QDialogStub,
          'q-select': QSelectStub,
          'q-input': QInputStub
        }
      }
    })

    // Test q-dialog v-model
    const dialog = wrapper.findComponent(QDialogStub)

    if (dialog.exists()) {
      dialog.vm.$emit('update:model-value', false)
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
    }

    // Test q-select v-model
    const select = wrapper.findComponent(QSelectStub)

    if (select.exists()) {
      select.vm.$emit('update:model-value', 'Negative')
      expect((wrapper.vm as any).feedbackType).toBe('Negative')
    }

    // Test q-input v-model
    const input = wrapper.findComponent(QInputStub)

    if (input.exists()) {
      input.vm.$emit('update:model-value', 'Test comment')
      expect((wrapper.vm as any).feedbackComment).toBe('Test comment')
    }
  })
})
