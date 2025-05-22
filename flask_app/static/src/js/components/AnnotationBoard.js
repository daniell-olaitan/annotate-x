import { Link } from './Link.js';
import { Popup } from './Popup.js';
import { Button } from './Button.js';
import { ImageList } from './ImageList.js';
import { Annotator } from './Annotator.js';
import { AnnotationList } from './AnnotationList.js';
import { Form } from './Form.js';
import { saveAnnotation } from '../utils.js';

import htm from 'https://esm.sh/htm';
import { h } from 'https://esm.sh/preact';
import { useRef, useState, useEffect } from 'https://esm.sh/preact/hooks';

const html = htm.bind(h);

export function AnnotationBoard({ projectId, setError, setLoading, setSaving }) {
  const projectList = useRef([]);
  const projectListTitle = useRef('no projects');

  const [project, setProject] = useState(null);

  const [formImages, setFormImages] = useState([]);
  const [formClasses, setFormClasses] = useState('');
  const [formProjectName, setFormProjectName] = useState('');

  const [annotations, setAnnotations] = useState(null);
  const [annotationList, setAnnotationList] = useState([]);

  const [images, setImages] = useState([]);
  const [image, setImage] = useState(null);

  const [popupPos, setPopupPos] = useState(null);
  const [popupPosNew, setPopupPosNew] = useState(null);
  const [subPopupPos, setSubPopupPos] = useState(null);
  const [popupPosAddImage, setPopupPosAddImage] = useState(null);
  const [projectPopupPos, setProjectPopupPos] = useState(null);
  const [subPopupTitle, setSubPopupTitle] = useState('');

  const [projectToBeDeleted, setProjectToBeDeleted] = useState(null);

  useEffect(() => {
    const fetchProject = async (pId) => {
      setLoading(true);

      try {
        let data;
        const res = await fetch(`/projects/${pId}`);

        if (!res.ok) throw new Error('Failed to fetch project');
        data = await res.json();

        const proj = data.data;
        setProject({
          id: proj.id,
          name: proj.name,
          categories: proj.categories
        });

        setImages(proj.images);
      } catch (err) {
        setError(err.message);
        setTimeout(() => setError(''), 3000);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject(projectId);
    }
  }, [projectId]);

  useEffect(() => {
    if (!images) return;

    const imageAnnotations = {};

    images.forEach(img => {
      imageAnnotations[img.id] = img.annotations;
    });

    if (!image) setImage(images[0]);
    setAnnotations(imageAnnotations);
  }, [images]);

  const handleClear = (e) => {
    if (image) {
      setAnnotations({...annotations, [image.id]: []});
    }
  };

  const handleNext = (e) => {
    saveAnnotation({
      id: image.id,
      body: JSON.stringify(annotations[image.id]),
      setError: setError,
      setSaving: setSaving
    });

    const index = images.findIndex(img => img.id === image.id);
    const nextImage = index + 1;

    if (nextImage === images.length) {
      setImage(images[0]);
    } else {
      setImage(images[nextImage]);
    }
  };

  const handlePrev = (e) => {
    saveAnnotation({
      id: image.id,
      body: JSON.stringify(annotations[image.id]),
      setError: setError,
      setSaving: setSaving
    });

    const index = images.findIndex(img => img.id === image.id);
    const prevImage = index - 1;

    if (prevImage === -1) {
      setImage(images[images.length-1]);
    } else {
      setImage(images[prevImage]);
    }
  };

  const handleSave = (e) => {
    saveAnnotation({
      id: image.id,
      body: JSON.stringify(annotations[image.id]),
      setError: setError,
      setSaving: setSaving
    });
  };

  const handleFinish = (e) => {
    saveAnnotation({
      id: image.id,
      body: JSON.stringify(annotations[image.id]),
      setError: setError,
      setSaving: setSaving
    });

    window.location.href = '/';
  };

  const handleProjectOptionClick = (e) => {
    e.preventDefault();

    const x = e.clientX;
    const y = e.clientY;

    setProjectPopupPos({x, y});
  };

  const handleProjectOptionSelect = (option, e) => {
    e.preventDefault();

    const x = e.clientX;
    const y = e.clientY;
    if (option) {
      if (option.id === 'new') {
        setFormClasses('');
        setFormProjectName('');

        setPopupPosNew({x, y});
      } else if (option.id === 'open') {
        projectList.current = [];
        projectListTitle.current = 'no projects';

        const fetchProjects = async () => {
          setLoading(true);

          try {
            let data;
            const res = await fetch('/projects');

            if (!res.ok) {
              if (res.status === 401) {
                window.location.href = '/signin';
              }
              else {
                throw new Error('Failed to fetch projects');
              }
            } else {
              data = await res.json();

              const projs = data.data;
              if (projs.length > 0) {
                projectListTitle.current = 'Your Projects';
                projs.forEach(proj => {
                  projectList.current.push({id: proj.name, value: proj});
                });
              }
            }

            setPopupPos({x, y});
          } catch (err) {
            setError(err.message);
            setTimeout(() => setError(''), 3000);
          } finally {
            setLoading(false);
          }
        };

        fetchProjects();
      } else if (option.id === 'images') {
        if (projectId) {
          setPopupPosAddImage({x, y});
        }
      } else if (option.id === 'export') {
        const exportProject = async () => {
          setSaving('Exporting project...')

          try {
            const res = await fetch(`/export/${projectId}`);

            if (!res.ok) {
              let error = new Error('Failed to export projects');
              if (res.status === 401) {
                window.location.href = '/signin';
              }
              else if (res.status === 404 || res.status === 400) {
                const data = await res.json();
                error = new Error(`${data.message}`);
              }

                throw error;
            } else {
              const blob = await res.blob()
              const url = window.URL.createObjectURL(blob);

              const a = document.createElement('a');
              a.href = url;
              a.download = `${project.name.toLowerCase()}_annotations.zip`;
              a.click();

              window.URL.revokeObjectURL(url);
            }
          } catch (err) {
            setError(err.message);
            setTimeout(() => setError(''), 3000);
          } finally {
            setSaving('');
          }
        };

        if (projectId) {
          exportProject()
        }
      }
    }

    setProjectPopupPos(null);
  };

  const handleProjectSelect = (project) => {
    if (project) {
      window.location.href = `/project/${project.id}`;
    }

    setPopupPos(null);
  };

  const onDeleteContextMenu = (proj, e) => {
    e.preventDefault();

    const x = e.clientX;
    const y = e.clientY;

    setSubPopupTitle(proj.name);
    setProjectToBeDeleted(proj);
    setSubPopupPos({x, y});
  };

  const handleDeleteProject = (proj, e) => {
    if (proj) {
      const deleteProject = async (pId) => {
        setSaving('Deleting project...');

        try {
          const res = await fetch(`/projects/${pId}`, {
            method: 'DELETE'
          });

          if (!res.ok) {
            if (res.status === 401) {
              window.location.href = '/signin';
            }
            else {
              throw new Error('Failed to delete project');
            }
          }

          if (proj.id === projectId) {
            window.location.href = '/';
          }
        } catch (err) {
          setError(err.message);
          setTimeout(() => setError(''), 3000);
        } finally {
          setSaving('');
        }
      };

      deleteProject(proj.id);
    }

    setSubPopupPos(null);
  };

  const createProject = () => {
    const colors = [
      "red",
      "blue",
      "green",
      "orange",
      "purple",
      "teal",
      "yellow",
      "pink",
      "brown",
      "cyan"
    ];

    const classes = [];
    const chosen = [];
    const project = new FormData();

    formClasses.split(';').forEach(cls => {
      if (cls.trim()) {
        let randomColor = colors[Math.floor(Math.random() * colors.length)];

        while (chosen.includes(randomColor)) {
          randomColor = colors[Math.floor(Math.random() * colors.length)];
        }

        classes.push({[cls.trim()]: randomColor});
        chosen.push(randomColor);
      }
    });

    project.append('name', formProjectName.trim());
    project.append('classes', JSON.stringify(classes));

    return project;
  };

  const handleNewProjectSubmit = (e) => {
    e.preventDefault();

    const createNewProject = async (project) => {
      setSaving('Creating Project...');

      try {
        let data;
        const res = await fetch('/projects', {
          method: 'POST',
          body: project,
        });

        if (!res.ok) {
          if (res.status === 401) {
            window.location.href = '/signin';
          }
          else {
            throw new Error('Failed to create project');
          }
        }

        data = await res.json();
        window.location.href = `/project/${data.data.id}`;
      } catch (err) {
        setError(err.message);
        setTimeout(() => setError(''), 3000);
      } finally {
        setSaving('');
      }
    };

    if (!formProjectName.trim() || !formClasses.trim()) {
      setError('Project name and classes are required');
      setTimeout(() => setError(''), 3000);
      setPopupPosNew(null);

      return;
    }

    const project = createProject();

    formImages.forEach((img, index) => {
      project.append(`image-${index}`, img);
    });

    createNewProject(project);
    setPopupPosNew(null);
  };

  const handleAddImageSubmit = (e) => {
    e.preventDefault(); e.preventDefault();

    const editProject = async (proj) => {
      setSaving('Adding images...');

      try {
        let data;
        const res = await fetch(`/projects/${projectId}/images`, {
          method: 'POST',
          body: proj,
        });

        if (!res.ok) {
          if (res.status === 401) {
            window.location.href = '/signin';
          }
          else {
            throw new Error('Failed to add images');
          }
        }

        data = await res.json();
        setImages(prev => [...prev, ...data.data]);
      } catch (err) {
        setError(err.message);
        setTimeout(() => setError(''), 3000);
      } finally {
        setSaving('');
      }
    };

    const proj = new FormData();

    formImages.forEach((img, index) => {
      proj.append(`image-${index}`, img);
    });

    editProject(proj);
    setPopupPosAddImage(null);
  };

  return html`
    <main id="main" class="flex-grow flex py-6 w-full">
      <div class="flex flex-col gap-4 w-1/5 border-r border-gray-200 px-4">
        <div class="flex gap-6 py-2">
          <${Link}
            text="Menu"
            handleClick=${handleProjectOptionClick}
          />

          ${projectPopupPos &&
            html`
              <${Popup}
                labels=${[
                  {id: 'New', value: {id: 'new'}},
                  {id: 'Open', value: {id: 'open'}},
                  {id: 'Add Images', value: {id: 'images'}},
                  {id: 'Export', value: {id: 'export'}}
                ]}
                popupPos=${projectPopupPos}
                onSelect=${handleProjectOptionSelect}
                title="Project Options"
              />
            `
          }

          ${popupPosNew &&
            html`
              <${Form}
                title="Create a Project"
                classes=${formClasses}
                popupPos=${popupPosNew}
                setClasses=${setFormClasses}
                projectName=${formProjectName}
                setPopupPos=${setPopupPosNew}
                handleSubmit=${handleNewProjectSubmit}
                includeImage=${true}
                setProjectName=${setFormProjectName}
                setImages=${setFormImages}
              />
            `
          }

          ${popupPos &&
            html`
              <${Popup}
                labels=${projectList.current}
                popupPos=${popupPos}
                onSelect=${handleProjectSelect}
                title=${projectListTitle.current}
                onContextMenu=${onDeleteContextMenu}
              />
            `
          }

          ${subPopupPos &&
            html`
              <${Popup}
                labels=${[{id: 'delete', value: projectToBeDeleted}]}
                popupPos=${subPopupPos}
                onSelect=${handleDeleteProject}
                title=${subPopupTitle}
                onContextMenu=${onDeleteContextMenu}
              />
            `
          }

          ${popupPosAddImage &&
            html`
              <${Form}
                title="Add Images"
                popupPos=${popupPosAddImage}
                setPopupPos=${setPopupPosAddImage}
                handleSubmit=${handleAddImageSubmit}
                includeImage=${true}
                imageOnly=${true}
                setImages=${setFormImages}
              />
            `
          }
        </div>

        <${ImageList}
          images=${images}
          setImages=${setImages}
          image=${image}
          setImage=${setImage}
          annotations=${annotations}
          setError=${setError}
          setSaving=${setSaving}
          setAnnotationList=${setAnnotationList}
        />
        <${AnnotationList}
          image=${image}
          annotations=${annotations}
          setAnnotations=${setAnnotations}
          annotationList=${annotationList}
          setAnnotationList=${setAnnotationList}
        />
      </div>

      ${!project
          ? html`<p class="py-16 px-32 h2-c font-semibold">open or create a project</p>`
          : html`
              <div class="flex flex-col gap-4 px-12 w-4/5">
                <div class="flex">
                  <p class="h2-c mr-auto">${project.name}</p>
                  ${image
                    ? html`
                      <div class="flex ml-6 gap-12">
                        <${Button}
                        text="finish"
                          classes="thin-btn-c"
                          handleClick=${handleFinish}
                        />
                        <div class="flex gap-4">
                          <${Button}
                            text="prev"
                            handleClick=${handlePrev}
                          />
                          <${Button}
                            text="next"
                            handleClick=${handleNext}
                          />
                        </div>
                        <div class="flex gap-4">
                          <${Button}
                            text="clear"
                            classes="thin-btn-c"
                            handleClick=${handleClear}
                          />
                          <${Button}
                            text="save"
                            classes="thin-btn-c"
                            handleClick=${handleSave}
                          />
                        </div>
                      </div>
                      `
                    : null
                  }
                </div>
                <div class="flex-grow">
                  <${Annotator}
                    image=${image}
                    classes=${project.categories}
                    annotations=${annotations}
                    setAnnotations=${setAnnotations}
                  />
                </div>
              </div>
            `
       }
    </main>
  `;
}
