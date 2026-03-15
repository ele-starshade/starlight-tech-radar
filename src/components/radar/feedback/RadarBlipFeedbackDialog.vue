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

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import type { Blip } from 'src/models/radar'
import { api } from 'src/boot/axios'

const props = defineProps<{
  modelValue: boolean
  blip: Blip | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const $q = useQuasar()
const { t } = useI18n()

const feedbackType = ref<string | null>(null)
const feedbackComment = ref('')
const sending = ref(false)

const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const feedbackOptions = computed(() => [
  { label: t('radar.feedback.types.positive'), value: 'Positive' },
  { label: t('radar.feedback.types.negative'), value: 'Negative' },
  { label: t('radar.feedback.types.suggestion'), value: 'Suggestion' },
  { label: t('radar.feedback.types.question'), value: 'Question' }
])

const sendFeedback = async () => {
  if (!props.blip || !feedbackType.value || !feedbackComment.value) return

  sending.value = true

  try {
    await api.post('/api/feedback', {
      blipName: props.blip.name,
      feedbackType: feedbackType.value,
      comment: feedbackComment.value
    })

    $q.notify({
      type: 'positive',
      message: t('radar.feedback.success')
    })

    show.value = false
    feedbackType.value = null
    feedbackComment.value = ''
  } catch (error) {
    console.error('Error sending feedback:', error)
    $q.notify({
      type: 'negative',
      message: t('radar.feedback.error')
    })
  } finally {
    sending.value = false
  }
}
</script>
