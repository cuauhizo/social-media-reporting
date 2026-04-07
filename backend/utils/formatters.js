const formatFacebookPosts = (publicacionesFb, fbHootsuiteData) => {
  return (publicacionesFb || [])
    .map(postExcel => {
      let imagenMapeada = 'https://placehold.co/300x400/00eb5d/ffffff?text=Post+Sin+Imagen'
      let tipoPost = postExcel.tipoPost || 'POST'

      if (fbHootsuiteData && fbHootsuiteData.realPosts) {
        const textoCortoExcel = postExcel.mensaje.substring(0, 20).trim()
        const postCoincidente = fbHootsuiteData.realPosts.find(p => p.text && p.text.includes(textoCortoExcel))

        if (postCoincidente) {
          if (postCoincidente.mediaUrls && postCoincidente.mediaUrls.length > 0) {
            imagenMapeada = postCoincidente.mediaUrls[0].thumbnailUrl || postCoincidente.mediaUrls[0].url
          }
          if (postCoincidente.postUrl && postCoincidente.postUrl.includes('reel')) tipoPost = 'REEL'
          else if (postCoincidente.mediaUrls && postCoincidente.mediaUrls[0] && postCoincidente.mediaUrls[0].url.includes('.mp4')) tipoPost = 'VIDEO'
        }
      }

      return {
        id: Math.random().toString(36).substr(2, 9),
        type: tipoPost,
        reach: postExcel.alcance,
        interactions: postExcel.interacciones,
        saved: postExcel.shares,
        img: imagenMapeada,
        postPermalink: postExcel.postPermalink,
        text: postExcel.mensaje.substring(0, 60) + '...',
        date: postExcel.fecha ? postExcel.fecha.split(' ')[0] : 'Sin fecha',
        tags: postExcel.tags || 'Sin etiqueta',
      }
    })
    .sort((a, b) => b.reach - a.reach)
}

const formatInstagramPosts = (publicacionesIg, igHootsuiteData) => {
  const igPostsList = []
  const igStoriesList = []

  ;(publicacionesIg || []).forEach(postExcel => {
    let imagenMapeada = 'https://placehold.co/300x400/ff7375/ffffff?text=IG+Sin+Imagen'
    let tipoPost = (postExcel.tipoPost || 'POST').toUpperCase()

    if (tipoPost.includes('STORY')) {
      imagenMapeada = 'https://placehold.co/300x533/00eb5d/ffffff?text=IG+Story'
      if (postExcel.postPermalink && postExcel.postPermalink.includes('scontent')) {
        imagenMapeada = postExcel.postPermalink
      }
    }

    if (igHootsuiteData && igHootsuiteData.realPosts) {
      const urlLimpiaExcel = (postExcel.postPermalink || '').split('?')[0].replace(/\/$/, '')
      const postCoincidente = igHootsuiteData.realPosts.find(p => {
        const urlLimpiaApi = (p.postUrl || '').split('?')[0].replace(/\/$/, '')
        return urlLimpiaApi === urlLimpiaExcel || (urlLimpiaApi !== '' && urlLimpiaExcel.includes(urlLimpiaApi))
      })

      if (postCoincidente) {
        if (postCoincidente.mediaUrls && postCoincidente.mediaUrls.length > 0) {
          imagenMapeada = postCoincidente.mediaUrls[0].thumbnailUrl || postCoincidente.mediaUrls[0].url
        }
        if (!tipoPost.includes('STORY')) {
          if (postCoincidente.postUrl && postCoincidente.postUrl.includes('reel')) tipoPost = 'REEL'
          else if (postCoincidente.mediaUrls && postCoincidente.mediaUrls.length > 1) tipoPost = 'CAROUSEL'
        }
      }
    }

    const postFormateado = {
      id: Math.random().toString(36).substr(2, 9),
      type: tipoPost.includes('STORY') ? 'STORY' : tipoPost,
      views: postExcel.visitas || postExcel.alcance || 0,
      reach: postExcel.alcance || 0,
      interactions: postExcel.interacciones || 0,
      saved: postExcel.saves || 0,
      likes: postExcel.likes || 0,
      shares: postExcel.shares || 0,
      img: imagenMapeada,
      postPermalink: postExcel.postPermalink,
      text: postExcel.mensaje ? postExcel.mensaje.substring(0, 60) + '...' : 'Historia sin texto',
      date: postExcel.fecha ? postExcel.fecha.split(' ')[0] : 'Sin fecha',
      tags: postExcel.tags || 'Sin etiqueta',
    }

    if (tipoPost.includes('STORY')) igStoriesList.push(postFormateado)
    else igPostsList.push(postFormateado)
  })

  return {
    topPostsIg: igPostsList.sort((a, b) => b.views - a.views),
    topStoriesIg: igStoriesList.sort((a, b) => b.views - a.views),
  }
}

const formatCasData = kpisManuales => {
  const dynamicCas = []
  if (kpisManuales) {
    for (const key in kpisManuales) {
      if (key.startsWith('cas_')) {
        let label = key.replace('cas_', '').replace(/_/g, ' ')
        label = label.charAt(0).toUpperCase() + label.slice(1)
        dynamicCas.push({
          label: label,
          value: parseFloat(kpisManuales[key]) || 0,
        })
      }
    }
  }
  return dynamicCas.sort((a, b) => b.value - a.value)
}

module.exports = {
  formatFacebookPosts,
  formatInstagramPosts,
  formatCasData,
}
