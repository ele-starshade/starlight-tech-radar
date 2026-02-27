<template>
  <q-dialog
    v-model="show"
    persistent
    aria-labelledby="feedback-dialog-title"
  >
    <q-card style="min-width: 350px" dark class="bg-dark text-white">
      <q-card-section>
        <div id="feedback-dialog-title" class="text-h6">{{ $t('radar.feedback.title') }} {{ blip?.name }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-select
          v-model="feedbackType"
          :options="feedbackOptions"
          :label="$t('radar.feedback.type')"
          dark
          emit-value
          map-options
          outlined
          class="q-mb-md"
          :placeholder="$t('radar.feedback.type_placeholder')"
        />

        <q-input
          v-model="feedbackComment"
          type="textarea"
          :label="$t('radar.feedback.comment')"
          dark
          outlined
          :placeholder="$t('radar.feedback.comment_placeholder')"
          autofocus
        />
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat :label="$t('radar.feedback.cancel')" v-close-popup />
        <q-btn
          flat
          :label="$t('radar.feedback.submit')"
          :loading="sending"
          @click="sendFeedback"
          :disable="!feedbackType || !feedbackComment"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { Blip } from 'src/models/radar'

export default defineComponent({
  name: 'RadarBlipFeedbackDialog',

  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    blip: {
      type: Object as PropType<Blip | null>,
      default: null
    }
  },

  emits: ['update:modelValue'],

  data () {
    return {
      feedbackType: null as string | null,
      feedbackComment: '',
      sending: false
    }
  },

  computed: {
    show: {
      get (): boolean {
        return this.modelValue
      },
      set (value: boolean) {
        this.$emit('update:modelValue', value)
      }
    },
    feedbackOptions () {
      return [
        { label: this.$t('radar.feedback.types.positive'), value: 'Positive' },
        { label: this.$t('radar.feedback.types.negative'), value: 'Negative' },
        { label: this.$t('radar.feedback.types.suggestion'), value: 'Suggestion' },
        { label: this.$t('radar.feedback.types.question'), value: 'Question' }
      ]
    }
  },

  methods: {
    async sendFeedback () {
      if (!this.blip || !this.feedbackType || !this.feedbackComment) return

      this.sending = true

      try {
        await this.$api.post('/api/feedback', {
          blipName: this.blip.name,
          feedbackType: this.feedbackType,
          comment: this.feedbackComment
        })

        this.$q.notify({
          type: 'positive',
          message: this.$t('radar.feedback.success')
        })

        this.show = false
        this.feedbackType = null
        this.feedbackComment = ''
      } catch (error) {
        console.error('Error sending feedback:', error)
        this.$q.notify({
          type: 'negative',
          message: this.$t('radar.feedback.error')
        })
      } finally {
        this.sending = false
      }
    }
  }
})
</script>
