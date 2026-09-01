import tinymce from 'tinymce'
import 'tinymce/icons/default'
import 'tinymce/themes/silver'
import 'tinymce/models/dom'
import 'tinymce/plugins/image'
import 'tinymce/plugins/link'
import 'tinymce/plugins/lists'
import 'tinymce/plugins/table'
import 'tinymce/skins/ui/oxide/skin.min.css'

if (typeof window !== 'undefined') {
  ;(window as unknown as { tinymce: typeof tinymce }).tinymce = tinymce
}

export { tinymce }
